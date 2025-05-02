//app/api/formations/[id]/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
	getFormationById,
	updateFormation,
} from "@/lib/services/formations/formationsService";

// GET endpoint existe déjà, on l'a gardé

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const id = resolvedParams.id;

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

// Nouvel endpoint PATCH pour la mise à jour
export async function PATCH(request, { params }) {
	try {
		const resolvedParams = await params;
		const id = resolvedParams.id;

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		// Récupérer les données du corps de la requête
		const data = await request.json();

		// Validation minimale des données
		if (!data.name || !data.description) {
			return NextResponse.json(
				{ error: "Nom et description sont requis" },
				{ status: 400 }
			);
		}

		// Vérifier que la formation existe
		const existingFormation = await getFormationById(id);

		if (!existingFormation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Mettre à jour la formation
		const updatedFormation = await updateFormation(id, data);

		return NextResponse.json({
			success: true,
			formation: updatedFormation,
		});
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

export async function DELETE(request, { params }) {
	try {
		const resolvedParams = await params;
		const id = resolvedParams.id;

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		// Vérifier que la formation existe
		const existingFormation = await prisma.formation.findUnique({
			where: { id },
		});

		if (!existingFormation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Supprimer la formation
		await prisma.formation.delete({
			where: { id },
		});

		return NextResponse.json({
			success: true,
			message: "Formation supprimée avec succès",
		});
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
