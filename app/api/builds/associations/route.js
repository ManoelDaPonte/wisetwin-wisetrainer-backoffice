// app/api/builds/associations/route.js
import { NextResponse } from "next/server";
import { getBuildAssociations, getOrganizationsForBuild } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Récupérer le paramètre buildId de l'URL
    const { searchParams } = new URL(request.url);
    const buildId = searchParams.get("buildId");

    if (!buildId) {
      return NextResponse.json(
        { error: "BuildID requis" },
        { status: 400 }
      );
    }

    // Récupérer les associations du build
    const associations = await getBuildAssociations(buildId);

    // Transformer les associations dans le format attendu par le client
    const formattedAssociations = associations.map(assoc => ({
      organizationId: assoc.organizationId,
      courseId: assoc.courseId,
      organization: {
        id: assoc.organization.id,
        name: assoc.organization.name
      },
      course: {
        id: assoc.course.id,
        name: assoc.course.name
      }
    }));

    return NextResponse.json({ 
      associations: formattedAssociations,
      total: formattedAssociations.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des associations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des associations: " + error.message },
      { status: 500 }
    );
  }
}