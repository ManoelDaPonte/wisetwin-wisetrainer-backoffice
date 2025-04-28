// app/api/formations/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer toutes les formations
export async function GET(request) {
	try {
		// Récupérer toutes les formations avec un count des contenus
		const formations = await prisma.formation.findMany({
			include: {
				_count: {
					select: { contents: true },
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		// Transformer les données pour inclure le count des contenus
		const formattedFormations = formations.map((formation) => ({
			...formation,
			contentsCount: formation._count.contents,
			_count: undefined,
		}));

		return NextResponse.json({ formations: formattedFormations });
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

// POST - Créer une nouvelle formation
export async function POST(request) {
	try {
		const data = await request.json();

		// Validation de base
		if (
			!data.name ||
			!data.formationId ||
			!data.category ||
			!data.difficulty ||
			!data.duration
		) {
			return NextResponse.json(
				{
					error: "Données incomplètes: nom, id, catégorie, difficulté et durée sont requis",
				},
				{ status: 400 }
			);
		}

		// Vérifier si une formation avec cet ID existe déjà
		const existingFormation = await prisma.formation.findUnique({
			where: { formationId: data.formationId },
		});

		if (existingFormation) {
			return NextResponse.json(
				{ error: "Une formation avec cet ID existe déjà" },
				{ status: 409 }
			);
		}

		// Créer la formation
		const formation = await prisma.formation.create({
			data: {
				formationId: data.formationId,
				name: data.name,
				description: data.description || "",
				imageUrl: data.imageUrl,
				category: data.category,
				difficulty: data.difficulty,
				duration: data.duration,
				objectMapping: data.objectMapping || {},
				buildId: data.buildId,
			},
		});

		return NextResponse.json({ formation }, { status: 201 });
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
