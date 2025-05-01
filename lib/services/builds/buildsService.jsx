//lib/services/builds/buildsService.js
import { prisma } from "@/lib/prisma";
import {
	getBuildsFromContainer,
	uploadBuild,
	getBuildDetails,
	getContainers,
} from "@/lib/azure";

/**
 * Récupère tous les builds d'une organisation
 * @param {string} organizationId - ID de l'organisation
 */
export async function getOrganizationBuilds(organizationId) {
	try {
		// Récupérer l'organisation
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { azureContainer: true },
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		const containerName =
			organization.azureContainer || `org-${organizationId}`;

		// Récupérer les builds depuis Azure
		let azureBuilds = [];
		try {
			azureBuilds = await getBuildsFromContainer(containerName);
		} catch (azureError) {
			console.warn(
				`Erreur lors de la récupération des builds Azure pour ${containerName}:`,
				azureError
			);
		}

		// Récupérer les associations de builds depuis OrganizationTraining
		const organizationTrainings =
			await prisma.organizationTraining.findMany({
				where: {
					organizationId,
					buildId: { not: null },
				},
				include: {
					course: true,
				},
			});

		// Créer une map des builds assignés avec leurs formations
		const assignedBuildsMap = new Map();
		organizationTrainings.forEach((training) => {
			if (training.buildId) {
				if (!assignedBuildsMap.has(training.buildId)) {
					assignedBuildsMap.set(training.buildId, {
						buildId: training.buildId,
						courses: [],
						isCustomBuild: training.isCustomBuild,
						isActive: training.isActive,
						assignedAt: training.assignedAt,
					});
				}
				assignedBuildsMap
					.get(training.buildId)
					.courses.push(training.course);
			}
		});

		// Fusionner les builds Azure avec les informations de la DB
		const builds = azureBuilds.map((azureBuild) => {
			const dbInfo = assignedBuildsMap.get(azureBuild.id);

			return {
				...azureBuild,
				id: azureBuild.id,
				organizationId: organizationId,
				status: dbInfo ? "assigned" : "unassigned",
				courses: dbInfo ? dbInfo.courses : [],
				isCustomBuild: dbInfo ? dbInfo.isCustomBuild : false,
				isActive: dbInfo ? dbInfo.isActive : true,
				assignedAt: dbInfo ? dbInfo.assignedAt : null,
				createdAt: new Date(azureBuild.lastModified),
				updatedAt: new Date(azureBuild.lastModified),
			};
		});

		// Ajouter les builds référencés dans la DB mais non trouvés dans Azure
		assignedBuildsMap.forEach((dbInfo, buildId) => {
			if (!builds.find((b) => b.id === buildId)) {
				builds.push({
					id: buildId,
					name: `Build ${buildId}`,
					version: "Unknown",
					organizationId: organizationId,
					status: "assigned",
					courses: dbInfo.courses,
					isCustomBuild: dbInfo.isCustomBuild,
					isActive: dbInfo.isActive,
					assignedAt: dbInfo.assignedAt,
					createdAt: dbInfo.assignedAt,
					updatedAt: dbInfo.assignedAt,
					size: 0,
					totalSize: "0 Bytes",
					files: [],
					url: "",
					description: "Build non trouvé dans Azure",
				});
			}
		});

		return builds;
	} catch (error) {
		console.error("Erreur lors de la récupération des builds:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Upload un build avec enregistrement en DB
 * @param {string} organizationId - ID de l'organisation
 * @param {File[]} files - Fichiers à uploader (doit contenir les 4 fichiers Unity)
 * @param {Object} metadata - Métadonnées du build
 */
export async function uploadBuildWithDb(organizationId, files, metadata) {
	try {
		// Récupérer l'organisation
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		const containerName =
			organization.azureContainer || `org-${organizationId}`;

		// Vérifier qu'on a les 4 fichiers requis
		const requiredFiles = [
			".data.gz",
			".framework.js.gz",
			".loader.js",
			".wasm.gz",
		];
		const uploadedFiles = files.map((f) => f.name.toLowerCase());

		const missingFiles = requiredFiles.filter(
			(ext) => !uploadedFiles.some((name) => name.endsWith(ext))
		);

		if (missingFiles.length > 0) {
			throw new Error(
				`Fichiers manquants pour un build Unity complet : ${missingFiles.join(
					", "
				)}`
			);
		}

		// Upload sur Azure avec la nouvelle fonction
		const azureResult = await uploadUnityBuild(
			containerName,
			files,
			metadata
		);

		// Le build est uploadé sur Azure mais n'est pas encore associé à une formation
		// L'association se fera via OrganizationTraining

		return {
			buildId: azureResult.buildName,
			azureResult,
			success: true,
		};
	} catch (error) {
		console.error("Erreur lors de l'upload du build:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
/**
 * Associe un build à une formation pour une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {string} courseId - ID de la formation
 * @param {string} buildId - ID du build
 */
export async function assignBuildToTraining(organizationId, courseId, buildId) {
	try {
		const training = await prisma.organizationTraining.findFirst({
			where: {
				organizationId,
				courseId,
			},
		});

		if (!training) {
			// Créer une nouvelle association si elle n'existe pas
			await prisma.organizationTraining.create({
				data: {
					organizationId,
					courseId,
					buildId,
					isCustomBuild: true,
				},
			});
		} else {
			// Mettre à jour l'association existante
			await prisma.organizationTraining.update({
				where: { id: training.id },
				data: {
					buildId,
					isCustomBuild: true,
				},
			});
		}

		return { success: true };
	} catch (error) {
		console.error("Erreur lors de l'association du build:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Supprime l'association d'un build avec une formation
 * @param {string} organizationId - ID de l'organisation
 * @param {string} courseId - ID de la formation
 */
export async function unassignBuildFromTraining(organizationId, courseId) {
	try {
		const training = await prisma.organizationTraining.findFirst({
			where: {
				organizationId,
				courseId,
			},
		});

		if (!training) {
			throw new Error("Association non trouvée");
		}

		await prisma.organizationTraining.update({
			where: { id: training.id },
			data: {
				buildId: null,
				isCustomBuild: false,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Erreur lors de la désassociation du build:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
