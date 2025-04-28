// app/api/formations/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer une formation par son ID
export async function GET(request, { params }) {
	try {
		const id = params.id;

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		// Récupérer la formation avec tout son contenu
		const formation = await prisma.formation.findUnique({
			where: { id },
			include: {
				contents: {
					orderBy: {
						order: "asc",
					},
					include: {
						steps: true,
						questions: {
							include: {
								options: true,
							},
						},
					},
				},
			},
		});

		if (!formation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

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

// PATCH - Mettre à jour une formation
export async function PATCH(request, { params }) {
	try {
		const id = params.id;
		const data = await request.json();

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		// Vérifier si la formation existe
		const existingFormation = await prisma.formation.findUnique({
			where: { id },
		});

		if (!existingFormation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Vérifier l'unicité de formationId si modifié
		if (
			data.formationId &&
			data.formationId !== existingFormation.formationId
		) {
			const formationWithSameId = await prisma.formation.findUnique({
				where: { formationId: data.formationId },
			});

			if (formationWithSameId) {
				return NextResponse.json(
					{ error: "Une formation avec cet ID existe déjà" },
					{ status: 409 }
				);
			}
		}

		// Mettre à jour la formation
		const updatedFormation = await prisma.formation.update({
			where: { id },
			data: {
				formationId: data.formationId,
				name: data.name,
				description: data.description,
				imageUrl: data.imageUrl,
				category: data.category,
				difficulty: data.difficulty,
				duration: data.duration,
				objectMapping: data.objectMapping,
				buildId: data.buildId,
			},
		});

		return NextResponse.json({ formation: updatedFormation });
	} catch (error) {
		console.error("Erreur lors de la mise à jour de la formation:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la mise à jour de la formation: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}

// DELETE - Supprimer une formation
export async function DELETE(request, { params }) {
	try {
		const id = params.id;

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		// Vérifier si la formation existe
		const existingFormation = await prisma.formation.findUnique({
			where: { id },
		});

		if (!existingFormation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Supprimer la formation (cascade delete configuré dans le schéma)
		await prisma.formation.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erreur lors de la suppression de la formation:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la suppression de la formation: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
