//app/api/formations/[id]/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
	try {
		const id = params.id;

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		console.log(`Fetching formation with ID: ${id}`);

		// Récupérer la formation avec toutes ses relations
		const formation = await prisma.formation.findUnique({
			where: { id },
			include: {
				organization: true,
				builds3D: true,
				courses: {
					include: {
						lessons: true,
					},
				},
				documentation: true,
				enrollments: true,
			},
		});

		if (!formation) {
			console.log(`Formation not found with ID: ${id}`);
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		console.log(`Formation found: ${formation.name}`);
		return NextResponse.json({ formation });
	} catch (error) {
		console.error("Erreur lors de la récupération de la formation:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération de la formation: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
