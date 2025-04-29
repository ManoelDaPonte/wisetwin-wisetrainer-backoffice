// app/api/organizations/[id]/trainings/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les formations associées à l'organisation
    const trainings = await prisma.organizationTraining.findMany({
      where: { organizationId: id },
      include: {
        course: true
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    return NextResponse.json({ trainings });
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const id = params.id;
    const { courseId, buildId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si la formation existe
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si l'association existe déjà
    const existingTraining = await prisma.organizationTraining.findFirst({
      where: {
        organizationId: id,
        courseId
      }
    });

    if (existingTraining) {
      return NextResponse.json(
        { error: "Cette formation est déjà associée à cette organisation" },
        { status: 409 }
      );
    }

    // Créer l'association
    const training = await prisma.organizationTraining.create({
      data: {
        organizationId: id,
        courseId,
        buildId,
        isCustomBuild: !!buildId
      },
      include: {
        course: true
      }
    });

    return NextResponse.json({ 
      success: true,
      training
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'association de la formation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'association de la formation: " + error.message },
      { status: 500 }
    );
  }
}