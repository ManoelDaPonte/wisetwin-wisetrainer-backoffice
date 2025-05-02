//app/api/formations/[id]/content/3d/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer tous les builds 3D d'une formation
export async function GET(request, { params }) {
	try {
		// Utiliser params.id directement au lieu de déstructurer
		const id = params.id;

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		// Vérifier si la formation existe
		const formation = await prisma.formation.findUnique({
			where: { id },
			include: {
				builds3D: true,
			},
		});

		if (!formation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ builds: formation.builds3D });
	} catch (error) {
		console.error("Erreur lors de la récupération des builds 3D:", error);
		return NextResponse.json(
			{ error: "Erreur serveur lors de la récupération des builds 3D" },
			{ status: 500 }
		);
	}
}

// Ajouter un build 3D à une formation
export async function POST(request, { params }) {
	try {
		// Utiliser params.id directement au lieu de déstructurer
		const resolvedParams = await params;
		const id = resolvedParams.id;

		// Vérifier que l'ID de formation est présent
		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		const data = await request.json();
		const { buildId, modules = [], objectMapping = {} } = data;
		
		console.log("POST /api/formations/[id]/content/3d: Tentative d'ajout du build", buildId);

		if (!buildId) {
			return NextResponse.json(
				{ error: "ID du build requis" },
				{ status: 400 }
			);
		}

		// Vérifier si la formation existe
		const formation = await prisma.formation.findUnique({
			where: { id },
			include: {
				builds3D: true,
			},
		});

		if (!formation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Si la formation a déjà un build 3D, supprimer les builds existants
		if (formation.builds3D && formation.builds3D.length > 0) {
			await prisma.build3D.deleteMany({
				where: {
					formationId: id,
				},
			});
		}

		// Extraire les informations du build à partir de l'ID
		// Format attendu: "containerName:buildName"
		let containerName, buildName;
		let searchBuildId = buildId; // Création d'une variable mutable pour la recherche

		if (buildId.includes(":")) {
			[containerName, buildName] = buildId.split(":");
		} else {
			return NextResponse.json(
				{ error: "Format d'ID de build invalide" },
				{ status: 400 }
			);
		}

		// Récupérer les détails du build depuis Azure
		const { getBuildsFromContainer } = await import("@/lib/azure");
		const containerBuilds = await getBuildsFromContainer(containerName);
		
		console.log("Builds disponibles:", containerBuilds.map(b => ({ id: b.id, internalId: b.internalId, name: b.name })));
		
		// Vérifier si le buildName a le préfixe wisetrainer/
		let searchBuildName = buildName;
		if (!buildName.startsWith("wisetrainer/")) {
			// Si le build semble être un wisetrainer (contient des mots-clés)
			if (buildName.toLowerCase().includes("wisetrainer") ||
				buildName.toLowerCase().includes("zone") ||
				buildName.toLowerCase().includes("logistique") ||
				buildName.toLowerCase().includes("cariste")) {
				
				// Préfixer avec wisetrainer/ si ce n'est pas déjà fait
				const originalBuildName = buildName;
				searchBuildName = `wisetrainer/${buildName.includes('/') ? buildName.split('/').pop() : buildName}`;
				searchBuildId = `${containerName}:${searchBuildName}`;
				
				console.log(`Build préfixé avec wisetrainer/: ${originalBuildName} -> ${searchBuildName}`);
			}
		}
		
		console.log("Recherche du build:", { buildId, searchBuildId, buildName, searchBuildName });
		
		// Fonction pour trouver le build correspondant
		const findBuildMatch = (build) => {
			// 1. ID exact avec l'ID original
			if (build.id === buildId) return true;
			
			// 2. ID exact avec l'ID de recherche (avec préfixe wisetrainer/ si applicable)
			if (build.id === searchBuildId) return true;
			
			// 3. internalId exact avec le nom original
			if (build.internalId === buildName) return true;
			
			// 4. internalId exact avec le nom de recherche
			if (build.internalId === searchBuildName) return true;
			
			// 5. Nom du fichier correspond au buildName, peu importe le chemin
			if (build.name === buildName) return true;
			
			// 6. Si le chemin du build se termine par le nom (quand on cherche sans le chemin)
			if (build.internalId && (
				build.internalId.endsWith(`/${buildName}`) || 
				build.internalId.endsWith(`/${searchBuildName}`)
			)) return true;
			
			// 7. Si buildName contient un chemin et correspond à l'internalId
			if ((buildName.includes('/') && build.internalId === buildName) ||
				(searchBuildName.includes('/') && build.internalId === searchBuildName)) return true;
			
			// 8. Si on cherche wisetrainer/Build mais qu'il existe comme Build à la racine
			if ((buildName.startsWith('wisetrainer/') && build.name === buildName.split('/').pop()) ||
				(searchBuildName.startsWith('wisetrainer/') && build.name === searchBuildName.split('/').pop())) return true;
			
			return false;
		};
		
		// Recherche le build
		let buildDetails = containerBuilds.find(findBuildMatch);

		// Chercher d'abord le build avec le préfixe wisetrainer/
		// Si on ne le trouve pas, chercher à la racine
		if (!buildDetails) {
			// Si on cherche déjà un build avec wisetrainer/
			if (searchBuildName.startsWith('wisetrainer/')) {
				const rootBuildName = searchBuildName.split('/').pop();
				console.log(`Build non trouvé dans wisetrainer/, recherche à la racine: ${rootBuildName}`);
				
				// Rechercher dans la racine
				buildDetails = containerBuilds.find(build => build.name === rootBuildName);
				
				if (buildDetails) {
					console.log(`Build trouvé à la racine, utilisation virtuelle comme s'il était dans wisetrainer/: ${buildDetails.name}`);
					// Simuler comme si le build était déjà dans wisetrainer/
					buildDetails = {
						...buildDetails,
						internalId: `wisetrainer/${buildDetails.name}`,
						id: `${containerName}:wisetrainer/${buildDetails.name}`
					};
				}
			} else {
				// On n'a pas cherché avec wisetrainer/ mais essayons quand même à la racine
				const rootBuildName = buildName;
				console.log(`Build non trouvé, recherche à la racine: ${rootBuildName}`);
				
				// Rechercher dans la racine
				buildDetails = containerBuilds.find(build => build.name === rootBuildName);
				
				if (buildDetails) {
					console.log(`Build trouvé à la racine: ${buildDetails.name}. Préfixage automatique avec wisetrainer/`);
					// Simuler comme si le build était dans wisetrainer/
					buildDetails = {
						...buildDetails,
						internalId: `wisetrainer/${buildDetails.name}`,
						id: `${containerName}:wisetrainer/${buildDetails.name}`
					};
				}
			}
		}

		if (!buildDetails) {
			console.error(`Build non trouvé: buildId=${buildId}, buildName=${buildName}`);
			console.error(`Builds disponibles:`, containerBuilds.map(b => ({ id: b.id, internalId: b.internalId, name: b.name })));
			return NextResponse.json(
				{ error: "Build non trouvé dans le container" },
				{ status: 404 }
			);
		}
		
		console.log("Build trouvé:", buildDetails.name);

		// Créer un nouveau Build3D associé à la formation
		const build3D = await prisma.build3D.create({
			data: {
				name: buildDetails.name,
				version: buildDetails.version,
				description: buildDetails.description || "",
				containerName: containerName,
				azureUrl: buildDetails.url,
				status: "available",
				objectMapping: objectMapping,
				formationId: id,
			},
		});

		// Ajouter les modules en tant que modules3D si nécessaire
		if (modules && modules.length > 0) {
			console.log(
				`Création de ${modules.length} modules pour le build 3D`
			);

			// Créer les modules un par un
			for (const module of modules) {
				await prisma.module3D.create({
					data: {
						moduleId: module.id,
						title: module.title || "Module sans titre",
						description: module.description || null,
						type: module.type || "guide",
						order: module.order || 1,
						content: module.educational || {},
						build3DId: build3D.id,
					},
				});
			}
		}

		return NextResponse.json(
			{
				success: true,
				build: build3D,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Erreur lors de l'ajout du build:", error);
		return NextResponse.json(
			{
				error: `Erreur serveur lors de l'ajout du build: ${error.message}`,
			},
			{ status: 500 }
		);
	}
}