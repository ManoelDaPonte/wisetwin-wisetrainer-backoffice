//app/api/formations/route.jsx
import { NextResponse } from "next/server";
import { getAllFormations } from "@/lib/services/formations/formationsService";

export async function GET(request) {
	try {
		// Récupérer les paramètres de l'URL
		const url = new URL(request.url);
		const sortBy = url.searchParams.get("sortBy") || "name";
		const sortDirection = url.searchParams.get("sortDirection") || "asc";
		const category = url.searchParams.get("category");
		const type = url.searchParams.get("type");

		// Construire les filtres
		const filter = {};
		if (category) filter.category = category;
		if (type) filter.type = type;

		// Options pour le service
		const options = {
			sortBy,
			sortDirection,
			filter,
		};

		// Appeler le service
		const formations = await getAllFormations(options);

		return NextResponse.json({ formations });
	} catch (error) {
		console.error("Erreur lors de la récupération des formations:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération des formations: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
