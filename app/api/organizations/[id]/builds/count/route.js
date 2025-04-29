//app/api/organizations/[id]/builds/count/route.js
import { NextResponse } from "next/server";
import { getBuildsFromContainer } from "@/lib/azure";
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
    
    try {
      // Récupérer les builds du container de l'organisation
      const builds = await getBuildsFromContainer(containerName);
      
      // Filtrer pour ne garder que les builds appartenant à cette organisation
      const organizationBuilds = builds.filter(build => {
        if (build.metadata && build.metadata.organizationId === id) {
          return true;
        }
        // Si le build n'a pas de metadata ou pas d'organizationId, on l'inclut si le container
        // est spécifique à l'organisation (pas un container partagé)
        return organization.azureContainer === containerName;
      });
      
      return NextResponse.json({ count: organizationBuilds.length });
    } catch (error) {
      console.error("Erreur lors de la récupération des builds:", error);
      return NextResponse.json({ count: 0 });
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ count: 0 });
  }
}