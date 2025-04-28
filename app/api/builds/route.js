// app/api/builds/route.js
import { NextResponse } from "next/server";
import { getAllBuilds, getBuildsFromContainer } from "@/lib/azure";

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

    // Ajouter le nombre d'organisations associées à chaque build
    // Ceci est un exemple et devra être adapté selon votre modèle de données
    const buildsWithOrgs = builds.map(build => ({
      ...build,
      associatedOrganizations: Math.floor(Math.random() * 10) // À remplacer par une vraie requête à la BDD
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