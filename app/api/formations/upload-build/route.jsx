//app/api/formations/upload-build/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    console.log("API uploadBuild: Début du traitement");
    const formData = await request.formData();
    const files = formData.getAll("files");
    const buildName = formData.get("buildName");
    const formationId = formData.get("formationId");
    const container = formData.get("container");
    // Spécifier un dossier par défaut pour les builds WiseTrainer
    let folderPath = formData.get("folderPath") || "";
    
    // Si le build semble être un WiseTrainer et qu'aucun dossier n'est spécifié
    if (buildName && (
      buildName.toLowerCase().includes("wisetrainer") || 
      buildName.toLowerCase().includes("zone") ||
      buildName.toLowerCase().includes("logistique") ||
      buildName.toLowerCase().includes("cariste")
    ) && !folderPath) {
      folderPath = "wisetrainer/";
      console.log("API uploadBuild: Dossier wisetrainer automatiquement défini:", folderPath);
    }
    
    console.log("API uploadBuild: Paramètres reçus", {
      filesCount: files.length,
      buildName,
      formationId,
      container,
      folderPath
    });
    
    // Log détaillé des fichiers reçus
    files.forEach((file, index) => {
      console.log(`Fichier ${index + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
      });
    });

    // Validation
    if (!files || files.length < 4) {
      console.error("API uploadBuild: Erreur - Moins de 4 fichiers fournis", files.length);
      return NextResponse.json(
        { error: "4 fichiers sont requis pour un build Unity complet" },
        { status: 400 }
      );
    }

    if (!buildName) {
      return NextResponse.json(
        { error: "Nom du build requis" },
        { status: 400 }
      );
    }

    if (!formationId) {
      return NextResponse.json(
        { error: "ID de formation requis" },
        { status: 400 }
      );
    }

    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
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

    // Déterminer le container à utiliser
    let containerName;
    
    if (container) {
      // Utiliser le container fourni
      containerName = container;
    } else if (formation.organization?.azureContainer) {
      // Utiliser le container de l'organisation
      containerName = formation.organization.azureContainer;
    } else if (formation.organizationId) {
      // Utiliser un container basé sur l'ID de l'organisation
      containerName = `org-${formation.organizationId}`;
    } else {
      // Utiliser un container par défaut
      containerName = "wisetwin";
    }

    // Préparer les métadonnées
    // Nettoyer les valeurs pour éviter les problèmes avec Azure
    const cleanBuildName = buildName.replace(/[^a-zA-Z0-9_. -]/g, "_");
    const cleanDescription = `Build pour la formation: ${formation.name}`.replace(/[^a-zA-Z0-9_. -]/g, "_");
    
    const metadata = {
      name: cleanBuildName,
      description: cleanDescription,
      version: "1.0",
      formationid: formationId,
      folderpath: folderPath
    };

    // Uploader les fichiers dans Azure Blob Storage
    const { uploadUnityBuild } = await import("@/lib/azure");
    const uploadResult = await uploadUnityBuild(containerName, files, metadata);

    if (!uploadResult.success) {
      throw new Error("Échec de l'upload du build");
    }

    // Créer un nouveau Build3D dans la base de données
    const build3D = await prisma.build3D.create({
      data: {
        name: buildName,
        version: "1.0",
        description: `Build pour la formation: ${formation.name}`,
        containerName: containerName,
        azureUrl: uploadResult.files.find(f => f.name.endsWith(".loader.js"))?.url || "",
        status: "available",
        objectMapping: {}, // Mapping vide par défaut
        formationId: formationId
      }
    });

    return NextResponse.json({
      success: true,
      buildId: `${containerName}:${uploadResult.buildName}`,
      build: build3D
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'upload du build:", error);
    return NextResponse.json(
      { error: `Erreur lors de l'upload du build: ${error.message}` },
      { status: 500 }
    );
  }
}