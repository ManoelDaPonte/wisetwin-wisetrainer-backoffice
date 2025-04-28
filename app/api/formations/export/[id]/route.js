// app/api/formations/export/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    // Récupérer la formation avec tout son contenu
    const dbFormation = await prisma.formation.findUnique({
      where: { id },
      include: {
        contents: {
          orderBy: {
            order: 'asc'
          },
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

    if (!dbFormation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Conversion au format du JSON attendu
    const exportedFormation = {
      id: dbFormation.formationId,
      name: dbFormation.name,
      description: dbFormation.description,
      imageUrl: dbFormation.imageUrl,
      category: dbFormation.category,
      difficulty: dbFormation.difficulty,
      duration: dbFormation.duration,
      objectMapping: dbFormation.objectMapping,
      buildId: dbFormation.buildId,
      modules: dbFormation.contents.map(content => {
        const baseModule = {
          id: content.contentId,
          order: content.order,
          title: content.title,
          description: content.description,
          type: content.type,
        };

        // Si contenu éducatif présent
        if (content.educationalTitle || content.educationalText) {
          baseModule.educational = {
            title: content.educationalTitle || "",
            content: content.educationalText ? JSON.parse(content.educationalText) : {},
            imageUrl: content.imageUrl
          };
        }

        // Si c'est un guide, inclure les étapes
        if (content.steps && content.steps.length > 0) {
          baseModule.steps = content.steps.map(step => ({
            id: step.stepId,
            title: step.title,
            instruction: step.instruction,
            validationEvent: step.validationEvent,
            validationType: step.validationType,
            hint: step.hint
          }));
          
          // Récupérer les noms d'événements de validation pour les boutons de séquence
          if (baseModule.steps.length > 0) {
            baseModule.sequenceButtons = baseModule.steps.map(step => step.validationEvent);
          }
        }

        // Si ce sont des questions, les inclure
        if (content.questions && content.questions.length > 0) {
          baseModule.questions = content.questions.map(question => ({
            id: question.questionId,
            text: question.text,
            type: question.type,
            image: question.image,
            options: question.options.map(option => ({
              id: option.optionId,
              text: option.text,
              isCorrect: option.isCorrect
            }))
          }));
        }

        return baseModule;
      })
    };

    return NextResponse.json({ formation: exportedFormation });
  } catch (error) {
    console.error("Erreur lors de l'exportation de la formation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'exportation: " + error.message },
      { status: 500 }
    );
  }
}