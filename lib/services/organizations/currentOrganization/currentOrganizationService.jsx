//lib/services/organizations/currentOrganization/currentOrganizationService.js
import { prisma } from "@/lib/prisma";

/**
 * Récupère une organisation par son ID avec tous ses détails
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Organisation avec ses détails
 */
export async function getOrganizationById(organizationId) {
	try {
		if (!organizationId) {
			throw new Error("ID d'organisation requis");
		}

		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				_count: {
					select: {
						members: true,
						trainings: true,
					},
				},
			},
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		// Formater les données
		return {
			...organization,
			membersCount: organization._count.members,
			trainingsCount: organization._count.trainings,
			_count: undefined,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'organisation:",
			error
		);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Récupère les membres d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Array>} Liste des membres
 */
export async function getOrganizationMembers(organizationId) {
	try {
		const members = await prisma.organizationMember.findMany({
			where: { organizationId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
			orderBy: {
				joinedAt: "desc",
			},
		});

		return members;
	} catch (error) {
		console.error("Erreur lors de la récupération des membres:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Récupère les builds d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Array>} Liste des builds
 */
export async function getOrganizationBuilds(organizationId) {
	try {
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { azureContainer: true },
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		const containerName =
			organization.azureContainer || `org-${organizationId}`;
		const { getBuildsFromContainer } = await import("@/lib/azure");
		const builds = await getBuildsFromContainer(containerName);

		return builds;
	} catch (error) {
		console.error("Erreur lors de la récupération des builds:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
