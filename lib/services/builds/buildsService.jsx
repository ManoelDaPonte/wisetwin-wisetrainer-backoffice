//lib/services/builds/buildsService.js
import { prisma } from "@/lib/prisma";
import { getBuildsFromContainer, uploadBuild } from "@/lib/azure";

/**
 * Synchronise les builds Azure avec la base de données
 * @param {string} organizationId - ID de l'organisation
 */
export async function syncOrganizationBuilds(organizationId) {
	try {
		// Récupérer l'organisation pour avoir son container
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
		const azureBuilds = await getBuildsFromContainer(containerName);

		// Récupérer les builds depuis la base de données
		const dbBuilds = await prisma.build.findMany({
			where: { organizationId },
		});

		// Identifier les builds manquants dans la DB
		const missingBuilds = azureBuilds.filter(
			(azureBuild) =>
				!dbBuilds.some(
					(dbBuild) => dbBuild.externalId === azureBuild.id
				)
		);

		// Ajouter les builds manquants dans la DB
		for (const build of missingBuilds) {
			await prisma.build.create({
				data: {
					externalId: build.id,
					name: build.name,
					version: build.version,
					description: build.description || "",
					organizationId: organizationId,
					metadata: build.metadata,
					status: "unassigned",
				},
			});
		}

		return { synced: missingBuilds.length };
	} catch (error) {
		console.error("Erreur lors de la synchronisation des builds:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Upload un build avec enregistrement en DB
 * @param {string} organizationId - ID de l'organisation
 * @param {File} files - Fichiers à uploader
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

		// Upload sur Azure
		const azureResult = await uploadBuild(containerName, files, metadata);

		// Enregistrer en DB
		const build = await prisma.build.create({
			data: {
				externalId: azureResult.id,
				name: metadata.name,
				version: metadata.version,
				description: metadata.description || "",
				organizationId: organizationId,
				metadata: metadata,
				status: "unassigned",
			},
		});

		return { build, azureResult };
	} catch (error) {
		console.error("Erreur lors de l'upload du build:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Récupère tous les builds d'une organisation
 * @param {string} organizationId - ID de l'organisation
 */
export async function getOrganizationBuilds(organizationId) {
	try {
		// Synchroniser d'abord
		await syncOrganizationBuilds(organizationId);

		// Récupérer les builds de la DB
		const builds = await prisma.build.findMany({
			where: { organizationId },
			orderBy: { createdAt: "desc" },
		});

		return builds;
	} catch (error) {
		console.error("Erreur lors de la récupération des builds:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
