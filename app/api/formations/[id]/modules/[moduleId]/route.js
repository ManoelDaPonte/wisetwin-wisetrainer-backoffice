// app/api/formations/[id]/modules/[moduleId]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer un module spécifique
export async function GET(request, { params }) {
  try {
    const { id: formationId, moduleId } = params;

    if (!formationId || !moduleId) {
      return NextResponse.json(
        { error: "ID de formation et ID de module requis" },
        { status: 400 }
      );
    }

    // Récupérer le module avec ses détails
    const module = await prisma.formationContent.findUnique({
      where: { 
        id: moduleId,
      },
      include: {
        steps: true,
        questions: {
          include: {
            options: true
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

    // Vérifier que le module appartient bien à la formation
    if (module.formationId !== formationId) {
      return NextResponse.json(
        { error: "Ce module n'appartient pas à cette formation" },
        { status: 403 }
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

// PATCH - Mettre à jour un module
export async function PATCH(request, { params }) {
  try {
    const { id: formationId, moduleId } = params;
    const data = await request.json();

    if (!formationId || !moduleId) {
      return NextResponse.json(
        { error: "ID de formation et ID de module requis" },
        { status: 400 }
      );
    }

    // Vérifier si le module existe
    const module = await prisma.formationContent.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le module appartient bien à la formation
    if (module.formationId !== formationId) {
      return NextResponse.json(
        { error: "Ce module n'appartient pas à cette formation" },
        { status: 403 }
      );
    }

    // Si contentId est modifié, vérifier l'unicité dans cette formation
    if (data.contentId && data.contentId !== module.contentId) {
      const existingModule = await prisma.formationContent.findFirst({
        where: {
          formationId,
          contentId: data.contentId,
          id: { not: moduleId } // Exclure le module actuel
        }
      });

      if (existingModule) {
        return NextResponse.json(
          { error: "Un module avec cet identifiant existe déjà dans cette formation" },
          { status: 409 }
        );
      }
    }

    // Mettre à jour le module
    const updatedModule = await prisma.formationContent.update({
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

    return NextResponse.json({ module: updatedModule });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du module:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du module: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un module
export async function DELETE(request, { params }) {
  try {
    const { id: formationId, moduleId } = params;

    if (!formationId || !moduleId) {
      return NextResponse.json(
        { error: "ID de formation et ID de module requis" },
        { status: 400 }
      );
    }

    // Vérifier si le module existe
    const module = await prisma.formationContent.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le module appartient bien à la formation
    if (module.formationId !== formationId) {
      return NextResponse.json(
        { error: "Ce module n'appartient pas à cette formation" },
        { status: 403 }
      );
    }

    // Supprimer le module (les étapes et questions seront supprimées en cascade)
    await prisma.formationContent.delete({
      where: { id: moduleId }
    });

    // Réordonner les modules restants
    const remainingModules = await prisma.formationContent.findMany({
      where: { formationId },
      orderBy: { order: 'asc' }
    });

    // Mettre à jour l'ordre des modules restants
    for (let i = 0; i < remainingModules.length; i++) {
      await prisma.formationContent.update({
        where: { id: remainingModules[i].id },
        data: { order: i + 1 }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du module:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du module: " + error.message },
      { status: 500 }
    );
  }
}