// app/api/formations/[id]/modules/[moduleId]/move/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH - Déplacer un module vers le haut ou vers le bas
export async function PATCH(request, { params }) {
  try {
    const { id: formationId, moduleId } = params;
    const { direction } = await request.json(); // "up" ou "down"

    if (!formationId || !moduleId) {
      return NextResponse.json(
        { error: "ID de formation et ID de module requis" },
        { status: 400 }
      );
    }

    if (!direction || (direction !== "up" && direction !== "down")) {
      return NextResponse.json(
        { error: "Direction invalide, doit être 'up' ou 'down'" },
        { status: 400 }
      );
    }

    // Vérifier si le module existe
    const module = await prisma.formationContent.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le module appartient bien à la formation
    if (module.formationId !== formationId) {
      return NextResponse.json(
        { error: "Ce module n'appartient pas à cette formation" },
        { status: 403 }
      );
    }

    // Récupérer tous les modules de la formation, triés par ordre
    const modules = await prisma.formationContent.findMany({
      where: { formationId },
      orderBy: { order: 'asc' }
    });

    // Trouver l'index du module actuel
    const currentIndex = modules.findIndex(m => m.id === moduleId);
    
    // Calculer le nouvel index en fonction de la direction
    const newIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(modules.length - 1, currentIndex + 1);
    
    // Si l'index ne change pas (déjà tout en haut ou tout en bas), retourner une erreur
    if (newIndex === currentIndex) {
      return NextResponse.json(
        { error: `Impossible de déplacer le module plus ${direction === "up" ? "haut" : "bas"}` },
        { status: 400 }
      );
    }

    // Échanger les ordres des deux modules
    const targetModule = modules[newIndex];
    
    // Utiliser une transaction pour garantir la cohérence
    await prisma.$transaction([
      // Utiliser un ordre temporaire pour éviter les conflits de contrainte unique
      prisma.formationContent.update({
        where: { id: moduleId },
        data: { order: -1 }
      }),
      prisma.formationContent.update({
        where: { id: targetModule.id },
        data: { order: module.order }
      }),
      prisma.formationContent.update({
        where: { id: moduleId },
        data: { order: targetModule.order }
      })
    ]);

    return NextResponse.json({ 
      success: true,
      message: `Module déplacé ${direction === "up" ? "vers le haut" : "vers le bas"} avec succès` 
    });
  } catch (error) {
    console.error("Erreur lors du déplacement du module:", error);
    return NextResponse.json(
      { error: "Erreur lors du déplacement du module: " + error.message },
      { status: 500 }
    );
  }
}