// app/api/organizations/[id]/trainings/[trainingId]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const { id: organizationId, trainingId } = params;

    if (!organizationId || !trainingId) {
      return NextResponse.json(
        { error: "IDs d'organisation et d'association requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si l'association existe
    const training = await prisma.organizationTraining.findUnique({
      where: { id: trainingId }
    });

    if (!training) {
      return NextResponse.json(
        { error: "Association non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si l'association appartient à l'organisation
    if (training.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Cette association n'appartient pas à cette organisation" },
        { status: 403 }
      );
    }

    // Supprimer l'association
    await prisma.organizationTraining.delete({
      where: { id: trainingId }
    });

    return NextResponse.json({ 
      success: true,
      message: "Association supprimée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'association:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'association: " + error.message },
      { status: 500 }
    );
  }
}