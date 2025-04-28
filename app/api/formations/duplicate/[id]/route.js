// app/api/formations/duplicate/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    // Récupérer la formation avec tout son contenu
    const sourceFormation = await prisma.formation.findUnique({
      where: { id },
      include: {
        contents: {
          include: {
            steps: true,
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });

    if (!sourceFormation) {
      return NextResponse.json(
        { error: "Formation source non trouvée" },
        { status: 404 }
      );
    }

    // Créer un nouvel ID pour la formation dupliquée
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const newFormationId = `${sourceFormation.formationId}_copy_${timestamp}`;

    // Démarrer une transaction pour la duplication
    const result = await prisma.$transaction(async (tx) => {
      // 1. Dupliquer la formation
      const duplicatedFormation = await tx.formation.create({
        data: {
          formationId: newFormationId,
          name: `${sourceFormation.name} (copie)`,
          description: sourceFormation.description,
          imageUrl: sourceFormation.imageUrl,
          category: sourceFormation.category,
          difficulty: sourceFormation.difficulty,
          duration: sourceFormation.duration,
          objectMapping: sourceFormation.objectMapping,
          buildId: sourceFormation.buildId,
        }
      });

      // 2. Dupliquer les contenus
      for (const content of sourceFormation.contents) {
        const duplicatedContent = await tx.formationContent.create({
          data: {
            contentId: content.contentId,
            formationId: duplicatedFormation.id,
            title: content.title,
            description: content.description,
            type: content.type,
            order: content.order,
            educationalTitle: content.educationalTitle,
            educationalText: content.educationalText,
            imageUrl: content.imageUrl,
          }
        });

        // 3. Dupliquer les étapes si présentes
        if (content.steps && content.steps.length > 0) {
          for (const step of content.steps) {
            await tx.formationStep.create({
              data: {
                stepId: step.stepId,
                contentId: duplicatedContent.id,
                title: step.title,
                instruction: step.instruction,
                validationEvent: step.validationEvent,
                validationType: step.validationType,
                hint: step.hint,
              }
            });
          }
        }

        // 4. Dupliquer les questions si présentes
        if (content.questions && content.questions.length > 0) {
          for (const question of content.questions) {
            const duplicatedQuestion = await tx.formationQuestion.create({
              data: {
                questionId: question.questionId,
                contentId: duplicatedContent.id,
                text: question.text,
                type: question.type,
                image: question.image,
              }
            });

            // 5. Dupliquer les options de réponse
            if (question.options && question.options.length > 0) {
              for (const option of question.options) {
                await tx.formationOption.create({
                  data: {
                    optionId: option.optionId,
                    questionId: duplicatedQuestion.id,
                    text: option.text,
                    isCorrect: option.isCorrect,
                  }
                });
              }
            }
          }
        }
      }

      return duplicatedFormation;
    });

    return NextResponse.json({
      success: true,
      message: "Formation dupliquée avec succès",
      id: result.id,
      formationId: result.formationId
    });
  } catch (error) {
    console.error("Erreur lors de la duplication de la formation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la duplication: " + error.message },
      { status: 500 }
    );
  }
}