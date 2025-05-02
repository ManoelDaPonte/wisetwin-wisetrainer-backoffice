//app/api/formations/[id]/content/3d/[buildId]/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer les détails d'un build 3D spécifique
export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const id = resolvedParams.id;
		const buildId = resolvedParams.buildId;

		if (!id || !buildId) {
			return NextResponse.json(
				{ error: "IDs de formation et de build requis" },
				{ status: 400 }
			);
		}

		// Vérifier si la formation existe et récupérer le build avec ses modules
		const formation = await prisma.formation.findUnique({
			where: { id },
			include: {
				builds3D: {
					where: { id: buildId },
					include: {
						modules3D: true, // Inclure les modules du build
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

		if (formation.builds3D.length === 0) {
			return NextResponse.json(
				{ error: "Build 3D non trouvé" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ build: formation.builds3D[0] });
	} catch (error) {
		console.error("Erreur lors de la récupération du build 3D:", error);
		return NextResponse.json(
			{ error: "Erreur serveur lors de la récupération du build 3D" },
			{ status: 500 }
		);
	}
}

// Supprimer un build 3D
export async function DELETE(request, { params }) {
	try {
		// Utiliser params.id et params.buildId directement
		const id = params.id;
		const buildId = params.buildId;

		if (!id || !buildId) {
			return NextResponse.json(
				{ error: "IDs de formation et de build requis" },
				{ status: 400 }
			);
		}

		// Vérifier si la formation existe et récupérer le build avec ses modules
		const formation = await prisma.formation.findUnique({
			where: { id },
			include: {
				builds3D: {
					where: { id: buildId },
					include: {
						modules3D: true, // Inclure les modules du build
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

		if (formation.builds3D.length === 0) {
			return NextResponse.json(
				{ error: "Build 3D non trouvé" },
				{ status: 404 }
			);
		}

		// Supprimer le build 3D
		await prisma.build3D.delete({
			where: { id: buildId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erreur lors de la suppression du build 3D:", error);
		return NextResponse.json(
			{ error: "Erreur serveur lors de la suppression du build 3D" },
			{ status: 500 }
		);
	}
}
