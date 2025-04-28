// app/api/organizations/route.js
import { NextResponse } from "next/server";
import { getAllOrganizations, getOrganizationById } from "@/lib/prisma";

export async function GET(request) {
	try {
		// Récupérer le paramètre id de l'URL
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (id) {
			// Récupérer une organisation spécifique
			const organization = await getOrganizationById(id);

			if (!organization) {
				return NextResponse.json(
					{ error: "Organisation non trouvée" },
					{ status: 404 }
				);
			}

			return NextResponse.json({ organization });
		} else {
			// Récupérer toutes les organisations
			const organizations = await getAllOrganizations();
			return NextResponse.json({ organizations });
		}
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des organisations:",
			error
		);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération des organisations: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
