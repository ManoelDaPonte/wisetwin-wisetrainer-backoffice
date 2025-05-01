//app/api/organizations/[id]/builds/upload/route.js
import { NextResponse } from "next/server";
import { uploadBuildWithDb } from "@/lib/services/builds/buildsService";

export async function POST(request, context) {
  try {
    // Dans Next.js 15, params est maintenant une Promise
    const { id: organizationId } = await context.params;
    
    const formData = await request.formData();
    
    const files = [];
    const metadata = {};
    
    // Extraire les fichiers et métadonnées du formData
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      } else {
        metadata[key] = value;
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const result = await uploadBuildWithDb(organizationId, files, metadata);

    return NextResponse.json({ 
      success: true, 
      buildId: result.buildId,
      azureResult: result.azureResult 
    });
  } catch (error) {
    console.error("Erreur lors de l'upload du build:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload: " + error.message },
      { status: 500 }
    );
  }
}