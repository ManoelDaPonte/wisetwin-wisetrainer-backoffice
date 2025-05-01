//lib/services/organizations/organizationsService.jsx
// services/organizations/organizationsService.js
import { prisma } from "@/lib/prisma";

/**
 * Récupère toutes les organisations avec le nombre de membres
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
		// Récupérer toutes les organisations
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

		// Transformer les données pour inclure les compteurs
		return organizations.map((org) => ({
			...org,
			membersCount: org._count.members,
			_count: undefined,
		}));
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des organisations:",
			error
		);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Recherche des organisations par nom ou description
 * @param {string} query - Texte de recherche
 * @returns {Promise<Array>} Liste des organisations correspondantes
 */
export async function searchOrganizations(query) {
	try {
		const organizations = await prisma.organization.findMany({
			where: {
				OR: [
					{ name: { contains: query, mode: "insensitive" } },
					{ description: { contains: query, mode: "insensitive" } },
				],
			},
			include: {
				_count: {
					select: {
						members: true,
					},
				},
			},
		});

		return organizations.map((org) => ({
			...org,
			membersCount: org._count.members,
			_count: undefined,
		}));
	} catch (error) {
		console.error("Erreur lors de la recherche des organisations:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Récupère le nombre total d'organisations
 * @returns {Promise<number>} Nombre total d'organisations
 */
export async function getOrganizationsCount() {
	try {
		return await prisma.organization.count();
	} catch (error) {
		console.error("Erreur lors du comptage des organisations:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
