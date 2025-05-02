//app/api/formations/[id]/content/3d/[buildId]/mapping/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer le mapping d'objets d'un build 3D
export async function GET(request, { params }) {
	try {
		// Utiliser params.id et params.buildId directement
		const resolvedParams = await params;
		const id = resolvedParams.id;
		const buildId = resolvedParams.buildId;

		if (!id || !buildId) {
			return NextResponse.json(
				{ error: "IDs de formation et de build requis" },
				{ status: 400 }
			);
		}

		// Vérifier si le build existe
		const build = await prisma.build3D.findUnique({
			where: {
				id: buildId,
				formationId: id,
			},
		});

		if (!build) {
			return NextResponse.json(
				{ error: "Build 3D non trouvé" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ objectMapping: build.objectMapping || {} });
	} catch (error) {
		console.error("Erreur lors de la récupération du mapping:", error);
		return NextResponse.json(
			{ error: "Erreur serveur lors de la récupération du mapping" },
			{ status: 500 }
		);
	}
}

// Mettre à jour le mapping d'objets d'un build 3D
export async function PUT(request, { params }) {
	try {
		// Utiliser params.id et params.buildId directement
		const id = params.id;
		const buildId = params.buildId;

		const data = await request.json();
		const { objectMapping } = data;

		if (!id || !buildId) {
			console.error("Mise à jour du mapping échouée: IDs manquants", {
				id,
				buildId,
			});
			return NextResponse.json(
				{ error: "IDs de formation et de build requis" },
				{ status: 400 }
			);
		}

		if (!objectMapping || typeof objectMapping !== "object") {
			console.error("Mise à jour du mapping échouée: Format invalide", {
				objectMapping,
			});
			return NextResponse.json(
				{ error: "Mapping d'objets invalide" },
				{ status: 400 }
			);
		}

		console.log(
			`Mise à jour du mapping pour build ${buildId} de la formation ${id}: ${
				Object.keys(objectMapping).length
			} objets mappés`
		);

		// Vérifier si le build existe
		const build = await prisma.build3D.findUnique({
			where: {
				id: buildId,
				formationId: id,
			},
		});

		if (!build) {
			console.error(
				`Build 3D non trouvé: buildId=${buildId}, formationId=${id}`
			);
			return NextResponse.json(
				{ error: "Build 3D non trouvé" },
				{ status: 404 }
			);
		}

		// Mettre à jour le mapping
		const updatedBuild = await prisma.build3D.update({
			where: { id: buildId },
			data: {
				objectMapping: objectMapping,
				updatedAt: new Date(),
			},
		});

		console.log(
			`✅ Mapping sauvegardé avec succès en base de données pour build ${buildId}:`,
			{
				count: Object.keys(objectMapping).length,
				objectKeys:
					Object.keys(objectMapping).slice(0, 5).join(", ") +
					(Object.keys(objectMapping).length > 5 ? "..." : ""),
				timestamp: updatedBuild.updatedAt,
			}
		);

		return NextResponse.json({
			objectMapping: updatedBuild.objectMapping,
			updatedAt: updatedBuild.updatedAt,
			success: true,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du mapping:", error);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la mise à jour du mapping",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
