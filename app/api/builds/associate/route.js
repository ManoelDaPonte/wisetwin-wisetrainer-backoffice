// app/api/builds/associate/route.js
import { NextResponse } from "next/server";
import { associateBuildWithOrganization, removeBuildAssociation } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { buildId, organizationId, courseId } = await request.json();
    
    if (!buildId || !organizationId || !courseId) {
      return NextResponse.json(
        { error: "BuildID, OrganizationID et CourseID sont requis" },
        { status: 400 }
      );
    }
    
    // Associer le build à l'organisation pour la formation spécifiée
    const association = await associateBuildWithOrganization(
      buildId,
      organizationId,
      courseId
    );
    
    return NextResponse.json({
      success: true,
      message: "Build associé avec succès",
      association
    });
    
  } catch (error) {
    console.error("Erreur lors de l'association du build:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'association du build: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { buildId, organizationId, courseId } = await request.json();
    
    if (!buildId || !organizationId || !courseId) {
      return NextResponse.json(
        { error: "BuildID, OrganizationID et CourseID sont requis" },
        { status: 400 }
      );
    }
    
    // Supprimer l'association
    await removeBuildAssociation(buildId, organizationId, courseId);
    
    return NextResponse.json({
      success: true,
      message: "Association supprimée avec succès"
    });
    
  } catch (error) {
    console.error("Erreur lors de la suppression de l'association:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'association: " + error.message },
      { status: 500 }
    );
  }
}