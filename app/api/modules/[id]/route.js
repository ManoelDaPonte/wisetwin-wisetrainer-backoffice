// app/api/modules/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer un module spécifique et sa formation parente
export async function GET(request, { params }) {
  try {
    const moduleId = params.id;

    if (!moduleId) {
      return NextResponse.json(
        { error: "ID de module requis" },
        { status: 400 }
      );
    }

    // Récupérer le module avec tous ses détails et la formation parente
    const module = await prisma.formationContent.findUnique({
      where: { id: moduleId },
      include: {
        steps: true,
        questions: {
          include: {
            options: true
          }
        },
        formation: {
          select: {
            id: true,
            formationId: true,
            name: true
          }
        }
      }
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ module });
  } catch (error) {
    console.error("Erreur lors de la récupération du module:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du module: " + error.message },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un module avec ses étapes ou ses questions
export async function PATCH(request, { params }) {
  try {
    const moduleId = params.id;
    const data = await request.json();

    if (!moduleId) {
      return NextResponse.json(
        { error: "ID de module requis" },
        { status: 400 }
      );
    }

    // Vérifier si le module existe
    const existingModule = await prisma.formationContent.findUnique({
      where: { id: moduleId },
      include: {
        steps: true,
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Commencer une transaction pour mettre à jour le module et ses composants liés
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le module principal
      const updatedModule = await tx.formationContent.update({
        where: { id: moduleId },
        data: {
          contentId: data.contentId,
          title: data.title,
          description: data.description,
          type: data.type,
          order: data.order,
          educationalTitle: data.educationalTitle,
          educationalText: data.educationalText,
          imageUrl: data.imageUrl,
        }
      });

      // 2. Gérer les étapes (pour les modules de type "guide")
      if (data.type === "guide" && Array.isArray(data.steps)) {
        // Supprimer toutes les étapes existantes
        await tx.formationStep.deleteMany({
          where: { contentId: moduleId }
        });

        // Créer les nouvelles étapes
        for (const step of data.steps) {
          await tx.formationStep.create({
            data: {
              stepId: step.stepId,
              contentId: moduleId,
              title: step.title,
              instruction: step.instruction,
              validationEvent: step.validationEvent,
              validationType: step.validationType || "3d",
              hint: step.hint,
            }
          });
        }
      }

      // 3. Gérer les questions (pour les modules de type "question")
      if (data.type === "question" && Array.isArray(data.questions)) {
        // D'abord, supprimer toutes les options des questions existantes
        for (const question of existingModule.questions) {
          await tx.formationOption.deleteMany({
            where: { questionId: question.id }
          });
        }

        // Ensuite, supprimer toutes les questions existantes
        await tx.formationQuestion.deleteMany({
          where: { contentId: moduleId }
        });

        // Créer les nouvelles questions avec leurs options
        for (const question of data.questions) {
          const createdQuestion = await tx.formationQuestion.create({
            data: {
              questionId: question.questionId,
              contentId: moduleId,
              text: question.text,
              type: question.type || "SINGLE",
              image: question.image,
            }
          });

          // Créer les options pour cette question
          if (Array.isArray(question.options)) {
            for (const option of question.options) {
              await tx.formationOption.create({
                data: {
                  optionId: option.optionId,
                  questionId: createdQuestion.id,
                  text: option.text,
                  isCorrect: option.isCorrect || false,
                }
              });
            }
          }
        }
      }

      // Récupérer le module mis à jour avec toutes ses relations
      return await tx.formationContent.findUnique({
        where: { id: moduleId },
        include: {
          steps: true,
          questions: {
            include: {
              options: true
            }
          }
        }
      });
    });

    return NextResponse.json({ 
      success: true,
      module: result 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du module:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du module: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un module et tous ses composants
export async function DELETE(request, { params }) {
  try {
    const moduleId = params.id;

    if (!moduleId) {
      return NextResponse.json(
        { error: "ID de module requis" },
        { status: 400 }
      );
    }

    // Vérifier si le module existe
    const existingModule = await prisma.formationContent.findUnique({
      where: { id: moduleId },
      include: {
        formation: true
      }
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Commencer une transaction pour la suppression
    await prisma.$transaction(async (tx) => {
      // Récupérer les questions pour supprimer leurs options
      const questions = await tx.formationQuestion.findMany({
        where: { contentId: moduleId }
      });

      // Supprimer les options de chaque question
      for (const question of questions) {
        await tx.formationOption.deleteMany({
          where: { questionId: question.id }
        });
      }

      // Supprimer les questions
      await tx.formationQuestion.deleteMany({
        where: { contentId: moduleId }
      });

      // Supprimer les étapes
      await tx.formationStep.deleteMany({
        where: { contentId: moduleId }
      });

      // Supprimer le module
      await tx.formationContent.delete({
        where: { id: moduleId }
      });

      // Réordonner les autres modules de la formation
      const formationId = existingModule.formationId;
      const remainingModules = await tx.formationContent.findMany({
        where: { formationId },
        orderBy: { order: 'asc' }
      });

      // Mettre à jour l'ordre
      for (let i = 0; i < remainingModules.length; i++) {
        await tx.formationContent.update({
          where: { id: remainingModules[i].id },
          data: { order: i + 1 }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du module:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du module: " + error.message },
      { status: 500 }
    );
  }
}