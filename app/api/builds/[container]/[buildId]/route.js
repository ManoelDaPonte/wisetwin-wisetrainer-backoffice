// app/api/builds/[container]/[buildId]/route.js
import { NextResponse } from "next/server";
import { getBuildDetails } from "@/lib/azure";

export async function GET(request, { params }) {
  try {
    const { container, buildId } = params;
    
    if (!container || !buildId) {
      return NextResponse.json(
        { error: "Container et ID du build requis" },
        { status: 400 }
      );
    }

    const decodedBuildId = decodeURIComponent(buildId);
    const buildDetails = await getBuildDetails(container, decodedBuildId);

    // Ici, vous pourriez ajouter des informations provenant de votre base de données
    // comme les organisations associées à ce build
    
    return NextResponse.json({ build: buildDetails });
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails du build:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails du build: " + error.message },
      { status: 500 }
    );
  }
}