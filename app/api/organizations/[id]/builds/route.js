// app/api/organizations/[id]/builds/route.js
import { NextResponse } from "next/server";
import { getBuildsFromContainer, getAllBuilds } from "@/lib/azure";
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

    // Déterminer le container à utiliser
    const containerName = organization.azureContainer || `org-${id}`;
    
    // Récupérer les builds du container de l'organisation
    const builds = await getBuildsFromContainer(containerName);
    
    // Filtrer pour ne garder que les builds appartenant à cette organisation
    // (si le metadata contient l'organizationId correspondant)
    const organizationBuilds = builds.filter(build => {
      if (build.metadata && build.metadata.organizationId === id) {
        return true;
      }
      // Si le build n'a pas de metadata ou pas d'organizationId, on l'inclut si le container
      // est spécifique à l'organisation (pas un container partagé)
      return organization.azureContainer === containerName;
    });
    
    // Trier les builds par date (plus récent en premier)
    organizationBuilds.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return NextResponse.json({ builds: organizationBuilds });
  } catch (error) {
    console.error("Erreur lors de la récupération des builds:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des builds: " + error.message },
      { status: 500 }
    );
  }
}