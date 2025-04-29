//app/api/builds/[id]/formations/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const buildId = params.id;

    if (!buildId) {
      return NextResponse.json(
        { error: "ID de build requis" },
        { status: 400 }
      );
    }

    // Récupérer les associations formation-build
    const trainings = await prisma.organizationTraining.findMany({
      where: {
        buildId: buildId
      },
      include: {
        course: true
      }
    });

    // Récupérer aussi les formations qui utilisent directement ce build
    const formations = await prisma.formation.findMany({
      where: {
        buildId: buildId
      }
    });

    // Fusionner et dédupliquer les deux ensembles de résultats
    const allFormations = [...formations];
    
    // Ajouter les courses des trainings s'ils ne sont pas déjà dans les formations
    trainings.forEach(training => {
      const courseExists = allFormations.some(formation => formation.id === training.course.id);
      if (!courseExists) {
        allFormations.push(training.course);
      }
    });

    return NextResponse.json({ formations: allFormations });
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations: " + error.message },
      { status: 500 }
    );
  }
}