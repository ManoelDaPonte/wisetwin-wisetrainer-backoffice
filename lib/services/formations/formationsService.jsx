//lib/services/formations/formationsService.jsx
import { prisma } from "@/lib/prisma";

/**
 * Récupère toutes les formations disponibles
 * @param {Object} options - Options de filtrage et de tri
 * @returns {Promise<Array>} Liste des formations
 */
export async function getAllFormations(options = {}) {
	const { sortBy = "name", sortDirection = "asc", filter = {} } = options;

	try {
		const formations = await prisma.course.findMany({
			where: filter,
			select: {
				id: true,
				name: true,
				description: true,
				type: true,
				category: true,
				createdAt: true,
				updatedAt: true,
				OrganizationTraining: {
					select: {
						id: true,
						organizationId: true,
						buildId: true,
					},
				},
			},
			orderBy: {
				[sortBy]: sortDirection,
			},
		});

		// Traiter les données pour les rendre plus adaptées au front-end
		const processedFormations = formations.map((formation) => ({
			id: formation.id,
			name: formation.name,
			description: formation.description,
			type: formation.type || "standard",
			category: formation.category || "non-catégorisé",
			createdAt: formation.createdAt,
			updatedAt: formation.updatedAt,
			assignedOrganizationsCount: formation.OrganizationTraining.length,
			hasAssignedBuilds: formation.OrganizationTraining.some(
				(t) => !!t.buildId
			),
		}));

		return processedFormations;
	} catch (error) {
		console.error("Erreur lors de la récupération des formations:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Récupère une formation par son ID
 * @param {string} id - ID de la formation
 * @returns {Promise<Object>} Détails de la formation
 */
export async function getFormationById(id) {
	try {
		const formation = await prisma.course.findUnique({
			where: { id },
			include: {
				OrganizationTraining: {
					include: {
						organization: true,
						build: true,
					},
				},
			},
		});

		if (!formation) {
			throw new Error("Formation non trouvée");
		}

		return formation;
	} catch (error) {
		console.error("Erreur lors de la récupération de la formation:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
