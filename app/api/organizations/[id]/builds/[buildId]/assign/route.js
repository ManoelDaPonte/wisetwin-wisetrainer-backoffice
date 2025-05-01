//app/api/organizations/[id]/builds/[buildId]/assign/route.js
import { NextResponse } from "next/server";
import { assignBuildToTraining } from "@/lib/services/builds/buildsService";

export async function POST(request, context) {
  try {
    // Dans Next.js 15, params est maintenant une Promise
    const { id: organizationId, buildId } = await context.params;
    const { courseId } = await request.json();

    if (!organizationId || !buildId || !courseId) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    await assignBuildToTraining(organizationId, courseId, buildId);

    return NextResponse.json({ 
      success: true,
      message: "Build associé avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de l'association du build:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'association: " + error.message },
      { status: 500 }
    );
  }
}