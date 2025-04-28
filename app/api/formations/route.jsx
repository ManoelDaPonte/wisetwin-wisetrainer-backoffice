// app/api/formations/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
	try {
		// Récupérer le paramètre unassigned de l'URL
		const { searchParams } = new URL(request.url);
		const unassignedOnly = searchParams.get("unassigned") === "true";

		// Définir les conditions de recherche
		const whereCondition = unassignedOnly ? { buildId: null } : {};

		// Récupérer toutes les formations avec un count des contenus
		const formations = await prisma.formation.findMany({
			where: whereCondition,
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
