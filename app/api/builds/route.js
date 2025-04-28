// app/api/builds/route.js
import { NextResponse } from "next/server";
import { getAllBuilds, getBuildsFromContainer } from "@/lib/azure";
import { getOrganizationsForBuild } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Récupérer le paramètre container de l'URL
    const { searchParams } = new URL(request.url);
    const container = searchParams.get("container");

    let builds;
    
    if (container) {
      // Récupérer les builds d'un container spécifique
      builds = await getBuildsFromContainer(container);
    } else {
      // Récupérer tous les builds
      builds = await getAllBuilds();
    }

    // Trier les builds par date de modification (du plus récent au plus ancien)
    builds.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    // Récupérer les organisations associées à chaque build
    const buildsWithOrgs = await Promise.all(builds.map(async (build) => {
      try {
        const organizations = await getOrganizationsForBuild(build.internalId);
        return {
          ...build,
          associatedOrganizations: organizations.length,
          organizations // Inclure les détails des organisations
        };
      } catch (error) {
        console.warn(`Erreur lors de la récupération des organisations pour le build ${build.id}:`, error);
        return {
          ...build,
          associatedOrganizations: 0,
          organizations: []
        };
      }
    }));

    return NextResponse.json({ builds: buildsWithOrgs });
  } catch (error) {
    console.error("Erreur lors de la récupération des builds:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des builds: " + error.message },
      { status: 500 }
    );
  }
}