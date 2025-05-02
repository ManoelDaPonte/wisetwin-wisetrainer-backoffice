//app/api/organizations/[id]/builds/route.jsx
import { NextResponse } from "next/server";
import { getOrganizationBuilds } from "@/lib/services/organizations/currentOrganization/currentOrganizationService";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    const builds = await getOrganizationBuilds(id);
    
    return NextResponse.json({ builds });
  } catch (error) {
    console.error("Erreur lors de la récupération des builds:", error);
    return NextResponse.json(
      { error: `Erreur lors de la récupération des builds: ${error.message}` },
      { status: 500 }
    );
  }
}