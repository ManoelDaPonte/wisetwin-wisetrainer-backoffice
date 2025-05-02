//app/api/formations/[id]/builds/container/route.jsx
import { NextResponse } from "next/server";
import { getBuildsFromContainer } from "@/lib/azure";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const container = searchParams.get('container');

    if (!id) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    if (!container) {
      return NextResponse.json(
        { error: "Nom du container requis" },
        { status: 400 }
      );
    }

    // Vérifier que la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        organization: true
      }
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les builds du container spécifié
    const builds = await getBuildsFromContainer(container);
    
    // Retourner les builds
    return NextResponse.json({ builds });
  } catch (error) {
    console.error("Erreur lors de la récupération des builds:", error);
    return NextResponse.json(
      { error: `Erreur lors de la récupération des builds: ${error.message}` },
      { status: 500 }
    );
  }
}