// app/api/formations/[id]/assign-build/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const formationId = params.id;
    const { buildId } = await request.json();

    if (!formationId) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    if (!buildId) {
      return NextResponse.json(
        { error: "ID de build requis" },
        { status: 400 }
      );
    }

    // Vérifier si la formation existe
    const existingFormation = await prisma.formation.findUnique({
      where: { id: formationId },
    });

    if (!existingFormation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la formation avec l'ID du build
    const updatedFormation = await prisma.formation.update({
      where: { id: formationId },
      data: {
        buildId: buildId,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Build associé avec succès",
      formation: updatedFormation
    });
  } catch (error) {
    console.error("Erreur lors de l'association du build:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'association du build: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
    try {
      const formationId = params.id;
  
      if (!formationId) {
        return NextResponse.json(
          { error: "ID de formation requis" },
          { status: 400 }
        );
      }
  
      // Vérifier si la formation existe
      const existingFormation = await prisma.formation.findUnique({
        where: { id: formationId },
      });
  
      if (!existingFormation) {
        return NextResponse.json(
          { error: "Formation non trouvée" },
          { status: 404 }
        );
      }
  
      // Mettre à jour la formation en supprimant l'association au build
      const updatedFormation = await prisma.formation.update({
        where: { id: formationId },
        data: {
          buildId: null,
        },
      });
  
      return NextResponse.json({ 
        success: true,
        message: "Association supprimée avec succès",
        formation: updatedFormation
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'association:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression de l'association: " + error.message },
        { status: 500 }
      );
    }
  }