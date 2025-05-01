// app/api/organizations/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    // Récupérer l'organisation avec ses membres et formations
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        trainings: {
          include: {
            course: true
          }
        },
        _count: {
          select: { 
            members: true,
            trainings: true
          }
        }
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Transformer pour ajouter les compteurs
    const formattedOrganization = {
      ...organization,
      membersCount: organization._count.members,
      trainingsCount: organization._count.trainings,
      _count: undefined
    };

    return NextResponse.json({ organization: formattedOrganization });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'organisation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'organisation: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = params.id;
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const existingOrganization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour l'organisation
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl,
        azureContainer: data.azureContainer,
        isActive: data.isActive
      }
    });

    return NextResponse.json({ 
      success: true,
      organization: updatedOrganization 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'organisation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'organisation: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const existingOrganization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!existingOrganization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer l'organisation
    await prisma.organization.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: "Organisation supprimée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'organisation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'organisation: " + error.message },
      { status: 500 }
    );
  }
}