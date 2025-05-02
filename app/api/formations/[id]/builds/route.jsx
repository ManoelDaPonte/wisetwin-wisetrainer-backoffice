//app/api/formations/[id]/builds/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer tous les builds associés à une formation
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        builds3D: true
      }
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ builds: formation.builds3D });
  } catch (error) {
    console.error("Erreur lors de la récupération des builds:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des builds" },
      { status: 500 }
    );
  }
}

// Ajouter un build à une formation
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const { buildId } = data;

    if (!buildId) {
      return NextResponse.json(
        { error: "ID du build requis" },
        { status: 400 }
      );
    }

    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        builds3D: true
      }
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }
    
    // Si la formation a déjà un build 3D, supprimer les builds existants
    if (formation.builds3D && formation.builds3D.length > 0) {
      await prisma.build3D.deleteMany({
        where: {
          formationId: id
        }
      });
    }

    // Extraire les informations du build à partir de l'ID
    // Format attendu: "containerName:buildName"
    let containerName, buildName;

    if (buildId.includes(':')) {
      [containerName, buildName] = buildId.split(':');
    } else {
      return NextResponse.json(
        { error: "Format d'ID de build invalide" },
        { status: 400 }
      );
    }

    // Récupérer les détails du build depuis Azure
    const { getBuildsFromContainer } = await import("@/lib/azure");
    const containerBuilds = await getBuildsFromContainer(containerName);
    const buildDetails = containerBuilds.find(b => b.id === buildId);

    if (!buildDetails) {
      return NextResponse.json(
        { error: "Build non trouvé dans le container" },
        { status: 404 }
      );
    }

    // Créer un nouveau Build3D associé à la formation
    const build3D = await prisma.build3D.create({
      data: {
        name: buildDetails.name,
        version: buildDetails.version,
        description: buildDetails.description || "",
        containerName: containerName,
        azureUrl: buildDetails.url,
        status: "available",
        objectMapping: {}, // Mapping vide par défaut
        formationId: id
      }
    });

    return NextResponse.json({ 
      success: true, 
      build: build3D 
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout du build:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'ajout du build" },
      { status: 500 }
    );
  }
}