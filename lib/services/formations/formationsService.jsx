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
		const formations = await prisma.formation.findMany({
			where: filter,
			orderBy: {
				[sortBy]: sortDirection,
			},
			include: {
				// Inclure l'organisation associée
				organization: {
					select: {
						id: true,
						name: true,
					},
				},
				// Inclure les compteurs pour les différents types de contenu
				builds3D: {
					select: {
						id: true,
					},
				},
				courses: {
					select: {
						id: true,
					},
				},
				documentation: {
					select: {
						id: true,
					},
				},
				// Inclure le nombre d'inscriptions
				enrollments: {
					select: {
						id: true,
					},
				},
			},
		});

		return formations;
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
		const formation = await prisma.formation.findUnique({
			where: { id },
			include: {
				organization: true,
				builds3D: true,
				courses: true,
				documentation: true,
				enrollments: true,
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

/**
 * Crée une nouvelle formation
 * @param {Object} formationData - Données de la formation
 * @returns {Promise<Object>} Formation créée
 */
export async function createFormation(formationData) {
	try {
		// Vérifier si l'ID externe est déjà utilisé
		const existingFormation = await prisma.formation.findFirst({
			where: {
				externalId: formationData.externalId,
			},
		});

		if (existingFormation) {
			throw new Error("Cet identifiant externe est déjà utilisé");
		}

		// Données pour la création
		const formationCreateData = {
			name: formationData.name,
			externalId: formationData.externalId,
			description: formationData.description,
			imageUrl: formationData.imageUrl || null,
			category: formationData.category,
			difficulty: formationData.difficulty,
			duration: formationData.duration,
			isPublic: formationData.isPublic || false,
			version: "1.0",
		};

		// Si une organisation est spécifiée, l'associer
		if (formationData.organizationId) {
			formationCreateData.organization = {
				connect: { id: formationData.organizationId },
			};
		}

		// Créer la formation
		const formation = await prisma.formation.create({
			data: formationCreateData,
			include: {
				organization: true,
			},
		});

		return formation;
	} catch (error) {
		console.error("Erreur lors de la création de la formation:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
