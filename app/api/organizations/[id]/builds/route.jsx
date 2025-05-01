//app/api/organizations/[id]/builds/route.js
import { NextResponse } from "next/server";
import { getOrganizationBuilds } from "@/lib/services/builds/buildsService";

export async function GET(request, { params }) {
	try {
		const organizationId = params.id;

		if (!organizationId) {
			return NextResponse.json(
				{ error: "ID d'organisation requis" },
				{ status: 400 }
			);
		}

		const builds = await getOrganizationBuilds(organizationId);

		return NextResponse.json({ builds });
	} catch (error) {
		console.error("Erreur lors de la récupération des builds:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération des builds: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
