//app/api/organizations/[id]/builds/route.js
import { NextResponse } from "next/server";
import { getOrganizationBuilds } from "@/lib/services/builds/buildsService";

export async function GET(request, context) {
	try {
		// Dans Next.js 15, params est maintenant une Promise
		const { id: organizationId } = await context.params;

		if (!organizationId) {
			return NextResponse.json(
				{ error: "ID d'organisation requis" },
				{ status: 400 }
			);
		}

		const builds = await getOrganizationBuilds(organizationId);

		return NextResponse.json({ builds });
	} catch (error) {
		console.error("Erreur détaillée:", error);
		return NextResponse.json(
			{
				error:
					error.message ||
					"Erreur lors de la récupération des builds",
				details:
					process.env.NODE_ENV === "development"
						? error.stack
						: undefined,
			},
			{ status: 500 }
		);
	}
}
