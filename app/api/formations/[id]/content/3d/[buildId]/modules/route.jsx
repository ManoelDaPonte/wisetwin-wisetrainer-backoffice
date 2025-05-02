//app/api/formations/[id]/content/3d/[buildId]/modules/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer les modules d'un build 3D
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

		// Vérifier si le build existe et récupérer ses modules
		const build = await prisma.build3D.findUnique({
			where: {
				id: buildId,
				formationId: id,
			},
			include: {
				modules3D: true,
			},
		});

		if (!build) {
			return NextResponse.json(
				{ error: "Build 3D non trouvé" },
				{ status: 404 }
			);
		}

		// Transformer les modules3D en format compatible avec l'interface
		const modules = build.modules3D.map((module) => {
			// Extraire les propriétés du contenu
			const { educational, sequenceButtons, steps, questions } =
				module.content || {};

			return {
				id: module.moduleId,
				title: module.title,
				description: module.description,
				type: module.type,
				order: module.order,
				// Distribuer les propriétés au bon niveau
				educational: educational || {},
				sequenceButtons: sequenceButtons || [],
				steps: steps || [],
				questions: questions || [],
			};
		});

		return NextResponse.json({ modules });
	} catch (error) {
		console.error("Erreur lors de la récupération des modules:", error);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la récupération des modules",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Mettre à jour les modules d'un build 3D
export async function PUT(request, { params }) {
	try {
		// Utiliser params.id et params.buildId directement
		const id = params.id;
		const buildId = params.buildId;

		const data = await request.json();
		const { modules } = data;

		if (!id || !buildId) {
			console.error("Mise à jour des modules échouée: IDs manquants", {
				id,
				buildId,
			});
			return NextResponse.json(
				{ error: "IDs de formation et de build requis" },
				{ status: 400 }
			);
		}

		if (!modules || !Array.isArray(modules)) {
			console.error("Mise à jour des modules échouée: Format invalide", {
				modules,
			});
			return NextResponse.json(
				{ error: "Liste de modules invalide" },
				{ status: 400 }
			);
		}

		console.log(
			`Mise à jour des modules pour build ${buildId} de la formation ${id}: ${modules.length} modules`
		);

		// Vérifier si le build existe
		const build = await prisma.build3D.findUnique({
			where: {
				id: buildId,
				formationId: id,
			},
			include: {
				modules3D: true,
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

		// 1. Supprimer tous les modules existants
		await prisma.module3D.deleteMany({
			where: {
				build3DId: buildId,
			},
		});

		// 2. Créer les nouveaux modules
		const createdModules = [];
		for (const module of modules) {
			// Préparer les données du module en incluant tous les champs importants
			// Détermine le type de module en fonction des données
			let moduleType = module.type || "guide";

			// Si le module a des questions, il s'agit d'un quiz
			if (module.questions && module.questions.length > 0) {
				moduleType = "quiz";
			}

			console.log(
				`Module ${module.id}: type=${moduleType}, has questions: ${
					module.questions?.length > 0
				}`
			);

			const moduleData = {
				moduleId: module.id,
				title: module.title || "Module sans titre",
				description: module.description || null,
				type: moduleType,
				order: module.order || 1,
				// Inclure toutes les propriétés importantes du module dans le contenu
				content: {
					// Données éducatives
					educational: module.educational || {},
					// Pour les guides
					sequenceButtons: module.sequenceButtons || [],
					steps: module.steps || [],
					// Pour les questionnaires
					questions: module.questions || [],
				},
				build3DId: buildId,
			};

			const createdModule = await prisma.module3D.create({
				data: moduleData,
			});
			createdModules.push(createdModule);
		}

		// 3. Mettre à jour la date de dernière modification du build
		const updatedBuild = await prisma.build3D.update({
			where: { id: buildId },
			data: { updatedAt: new Date() },
			include: { modules3D: true },
		});

		console.log(
			`✅ Modules sauvegardés avec succès en base de données pour build ${buildId}:`,
			{
				count: createdModules.length,
				moduleTitles: modules.map((m) => m.title || m.id).join(", "),
				timestamp: updatedBuild.updatedAt,
			}
		);

		// 4. Transformer les modules en format compatible avec l'interface
		const formattedModules = updatedBuild.modules3D.map((module) => {
			// Extraire les propriétés du contenu
			const { educational, sequenceButtons, steps, questions } =
				module.content || {};

			return {
				id: module.moduleId,
				title: module.title,
				description: module.description,
				type: module.type,
				order: module.order,
				// Distribuer les propriétés au bon niveau
				educational: educational || {},
				sequenceButtons: sequenceButtons || [],
				steps: steps || [],
				questions: questions || [],
			};
		});

		return NextResponse.json({
			modules: formattedModules,
			updatedAt: updatedBuild.updatedAt,
			success: true,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour des modules:", error);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la mise à jour des modules",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
