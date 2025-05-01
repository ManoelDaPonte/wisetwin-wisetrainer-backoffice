//app/api/organizations/route.jsx
import { NextResponse } from "next/server";
import { getAllOrganizations } from "@/lib/services/organizations/organizationsService";

export async function GET(request) {
	try {
		// Appeler le service pour récupérer les organisations
		const organizations = await getAllOrganizations();

		return NextResponse.json({ organizations });
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
