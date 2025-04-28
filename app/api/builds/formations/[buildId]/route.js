// app/api/builds/formations/[buildId]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const buildId = params.buildId;

    if (!buildId) {
      return NextResponse.json(
        { error: "ID de build requis" },
        { status: 400 }
      );
    }

    // Récupérer toutes les formations qui utilisent ce build
    const formations = await prisma.formation.findMany({
      where: {
        buildId: buildId,
      },
      select: {
        id: true,
        formationId: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        duration: true,
        imageUrl: true,
        updatedAt: true,
        _count: {
          select: { contents: true },
        },
      },
    });

    // Transformer les données pour inclure le count des contenus
    const formattedFormations = formations.map((formation) => ({
      ...formation,
      contentsCount: formation._count.contents,
      _count: undefined,
    }));

    return NextResponse.json({ formations: formattedFormations });
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations: " + error.message },
      { status: 500 }
    );
  }
}