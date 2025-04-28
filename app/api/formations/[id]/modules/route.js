// app/api/formations/[id]/modules/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les modules d'une formation
export async function GET(request, { params }) {
  try {
    const formationId = params.id;

    if (!formationId) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId }
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les modules de la formation
    const modules = await prisma.formationContent.findMany({
      where: { formationId },
      include: {
        steps: true,
        questions: {
          include: {
            options: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des modules: " + error.message },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau module pour une formation
export async function POST(request, { params }) {
  try {
    const formationId = params.id;
    const data = await request.json();

    // Validation de base
    if (!formationId) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    if (!data.contentId || !data.title || !data.type) {
      return NextResponse.json(
        { error: "Données incomplètes: identifiant, titre et type sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId }
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si un module avec cet ID existe déjà dans cette formation
    const existingModule = await prisma.formationContent.findFirst({
      where: {
        formationId,
        contentId: data.contentId
      }
    });

    if (existingModule) {
      return NextResponse.json(
        { error: "Un module avec cet identifiant existe déjà dans cette formation" },
        { status: 409 }
      );
    }

    // Créer le module
    const module = await prisma.formationContent.create({
      data: {
        contentId: data.contentId,
        formationId,
        title: data.title,
        description: data.description || "",
        type: data.type,
        order: data.order || 1,
        educationalTitle: data.educationalTitle || null,
        educationalText: data.educationalText || null,
        imageUrl: data.imageUrl || null,
      }
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du module:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du module: " + error.message },
      { status: 500 }
    );
  }
}