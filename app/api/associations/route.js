// app/api/associations/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBuildsFromContainer } from "@/lib/azure";

export async function GET(request) {
  try {
    // Récupérer toutes les formations avec leurs informations de base
    const formations = await prisma.formation.findMany({
      select: {
        id: true,
        formationId: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        duration: true,
        buildId: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Récupérer tous les builds pour obtenir leurs noms et autres détails
    const builds = {};
    
    // Créer un cache pour les conteneurs de builds déjà récupérés
    const containerCache = {};
    
    // Enrichir les formations avec les informations sur les builds
    const enrichedFormations = await Promise.all(formations.map(async (formation) => {
      if (!formation.buildId) {
        return {
          ...formation,
          buildName: null,
          buildContainer: null,
        };
      }

      // Déterminer le nom du conteneur et l'ID interne du build
      // Format du buildId: "container:internalId"
      let buildContainer, buildInternalId;
      
      if (formation.buildId.includes(':')) {
        [buildContainer, buildInternalId] = formation.buildId.split(':');
      } else {
        // Si pas de conteneur spécifié, utiliser le conteneur par défaut
        buildContainer = "builds";
        buildInternalId = formation.buildId;
      }
      
      // Chercher les détails du build dans le cache ou les récupérer
      if (!builds[formation.buildId]) {
        // Vérifier si nous avons déjà récupéré ce conteneur
        if (!containerCache[buildContainer]) {
          try {
            const containerBuilds = await getBuildsFromContainer(buildContainer);
            containerCache[buildContainer] = containerBuilds;
            
            // Ajouter tous les builds de ce conteneur à notre cache
            for (const build of containerBuilds) {
              builds[build.id] = build;
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération des builds du conteneur ${buildContainer}:`, error);
            containerCache[buildContainer] = [];
          }
        }
        
        // Chercher le build spécifique dans notre cache de conteneur
        const buildDetails = containerCache[buildContainer]?.find(
          build => build.internalId === buildInternalId
        );
        
        if (buildDetails) {
          builds[formation.buildId] = buildDetails;
        }
      }
      
      const buildDetails = builds[formation.buildId];
      
      return {
        ...formation,
        buildName: buildDetails?.name || "Build inconnu",
        buildContainer: buildContainer,
      };
    }));

    return NextResponse.json({ associations: enrichedFormations });
  } catch (error) {
    console.error("Erreur lors de la récupération des associations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des associations: " + error.message },
      { status: 500 }
    );
  }
}