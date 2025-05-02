//app/api/formations/route.jsx
import { NextResponse } from "next/server";
import {
	getAllFormations,
	createFormation,
} from "@/lib/services/formations/formationsService";

export async function GET(request) {
	try {
		// Récupérer les paramètres de la requête
		const { searchParams } = new URL(request.url);
		const sortBy = searchParams.get("sortBy") || "name";
		const sortDirection = searchParams.get("sortDirection") || "asc";
		const category = searchParams.get("category");

		// Construire le filtre en fonction des paramètres
		const filter = {};
		if (category) {
			filter.category = category;
		}

		// Appeler le service pour récupérer les formations
		const formations = await getAllFormations({
			sortBy,
			sortDirection,
			filter,
		});

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

export async function POST(request) {
	try {
		// Récupérer les données du corps de la requête
		const data = await request.json();

		// Validation des données
		if (!data.name || !data.externalId || !data.description) {
			return NextResponse.json(
				{
					error: "Données manquantes: nom, identifiant et description sont requis",
				},
				{ status: 400 }
			);
		}

		// Créer la formation (sans avoir besoin de spécifier manuellement l'organizationId)
		const formation = await createFormation(data);

		return NextResponse.json({ success: true, formation }, { status: 201 });
	} catch (error) {
		console.error("Erreur lors de la création de la formation:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la création de la formation: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
