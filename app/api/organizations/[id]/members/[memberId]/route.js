// app/api/organizations/[id]/members/[memberId]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const { id: organizationId, memberId } = params;

    if (!organizationId || !memberId) {
      return NextResponse.json(
        { error: "IDs d'organisation et de membre requis" },
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

    // Vérifier si le membre existe
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le membre appartient à l'organisation
    if (member.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Ce membre n'appartient pas à cette organisation" },
        { status: 403 }
      );
    }

    // Vérifier si c'est le dernier OWNER
    if (member.role === "OWNER") {
      const ownersCount = await prisma.organizationMember.count({
        where: {
          organizationId,
          role: "OWNER"
        }
      });

      if (ownersCount <= 1) {
        return NextResponse.json(
          { error: "Impossible de supprimer le dernier propriétaire de l'organisation" },
          { status: 400 }
        );
      }
    }

    // Supprimer le membre
    await prisma.organizationMember.delete({
      where: { id: memberId }
    });

    return NextResponse.json({ 
      success: true,
      message: "Membre supprimé avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre: " + error.message },
      { status: 500 }
    );
  }
}