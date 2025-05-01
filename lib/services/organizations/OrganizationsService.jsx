//lib/services/organizations/organizationsService.jsx
import { prisma } from "@/lib/prisma";
import { getBuildsFromContainer } from "@/lib/azure";

/**
 * Récupère le nombre de builds pour une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<number>} Nombre de builds
 */
export async function getOrganizationBuildsCount(organizationId) {
	try {
		// Récupérer l'organisation pour avoir son container
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { azureContainer: true },
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		// Utiliser le container spécifique à l'organisation ou un container par défaut
		const containerName =
			organization.azureContainer || `org-${organizationId}`;

		// Récupérer les builds
		const builds = await getBuildsFromContainer(containerName);

		return builds.length;
	} catch (error) {
		console.error(
			`Erreur lors du comptage des builds pour ${organizationId}:`,
			error
		);
		return 0;
	}
}

/**
 * Récupère toutes les organisations avec leurs compteurs
 * @param {Object} options - Options de filtrage et tri
 * @returns {Promise<Array>} Liste des organisations formatées
 */
export async function getAllOrganizations(options = {}) {
	const {
		sortBy = "updatedAt",
		sortDirection = "desc",
		filter = {},
	} = options;

	try {
		// Récupérer les organisations avec leur nombre de membres
		const organizations = await prisma.organization.findMany({
			include: {
				_count: {
					select: {
						members: true,
					},
				},
			},
			orderBy: {
				[sortBy]: sortDirection,
			},
			where: filter,
		});

		// Formater les données : renommer le compteur de membres et récupérer le nombre de builds
		const formattedOrganizations = await Promise.all(
			organizations.map(async (org) => {
				const buildsCount = await getOrganizationBuildsCount(org.id);

				return {
					...org,
					membersCount: org._count.members,
					buildsCount: buildsCount,
					_count: undefined, // Retirer le champ _count interne
				};
			})
		);

		return formattedOrganizations;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des organisations:",
			error
		);
		throw new Error(`Erreur: ${error.message}`);
	}
}
