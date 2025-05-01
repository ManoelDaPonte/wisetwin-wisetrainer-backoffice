// services/organization/organizationService.js
import { prisma } from "@/lib/prisma";

/**
 * Récupère une organisation par son ID avec détails
 * @param {string} id - ID de l'organisation
 * @returns {Promise<Object>} Détails de l'organisation
 */
export async function getOrganizationById(id) {
	try {
		if (!id) {
			throw new Error("ID d'organisation requis");
		}

		// Récupérer l'organisation avec ses membres et formations
		const organization = await prisma.organization.findUnique({
			where: { id },
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
				trainings: {
					include: {
						course: true,
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

		// Transformer pour ajouter les compteurs
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
 * Met à jour une organisation
 * @param {string} id - ID de l'organisation
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Organisation mise à jour
 */
export async function updateOrganization(id, data) {
	try {
		if (!id) {
			throw new Error("ID d'organisation requis");
		}

		// Vérifier si l'organisation existe
		const existingOrganization = await prisma.organization.findUnique({
			where: { id },
		});

		if (!existingOrganization) {
			throw new Error("Organisation non trouvée");
		}

		// Mettre à jour l'organisation
		const updatedOrganization = await prisma.organization.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description,
				logoUrl: data.logoUrl,
				azureContainer: data.azureContainer,
				isActive: data.isActive,
			},
		});

		return updatedOrganization;
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de l'organisation:",
			error
		);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Supprime une organisation
 * @param {string} id - ID de l'organisation
 * @returns {Promise<boolean>} Succès de la suppression
 */
export async function deleteOrganization(id) {
	try {
		if (!id) {
			throw new Error("ID d'organisation requis");
		}

		// Vérifier si l'organisation existe
		const existingOrganization = await prisma.organization.findUnique({
			where: { id },
		});

		if (!existingOrganization) {
			throw new Error("Organisation non trouvée");
		}

		// Supprimer l'organisation
		await prisma.organization.delete({
			where: { id },
		});

		return true;
	} catch (error) {
		console.error(
			"Erreur lors de la suppression de l'organisation:",
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
		if (!organizationId) {
			throw new Error("ID d'organisation requis");
		}

		// Vérifier si l'organisation existe
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		// Récupérer les membres
		return await prisma.organizationMember.findMany({
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
	} catch (error) {
		console.error("Erreur lors de la récupération des membres:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Ajoute un membre à une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {Object} memberData - Données du membre à ajouter
 * @returns {Promise<Object>} Membre ajouté
 */
export async function addOrganizationMember(organizationId, memberData) {
	try {
		const { email, role = "MEMBER" } = memberData;

		if (!organizationId) {
			throw new Error("ID d'organisation requis");
		}

		if (!email) {
			throw new Error("Email requis");
		}

		// Vérifier les rôles valides
		const validRoles = ["OWNER", "ADMIN", "MEMBER"];
		if (role && !validRoles.includes(role)) {
			throw new Error("Rôle invalide");
		}

		// Vérifier si l'organisation existe
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		// Vérifier si l'utilisateur existe
		let user = await prisma.user.findUnique({
			where: { email },
		});

		// Si l'utilisateur n'existe pas, le créer
		if (!user) {
			user = await prisma.user.create({
				data: {
					email,
					auth0Id: `temp-${Date.now()}`, // Temporaire, à remplacer quand l'utilisateur se connecte
					name: email.split("@")[0], // Nom par défaut basé sur l'email
				},
			});
		}

		// Vérifier si l'utilisateur est déjà membre
		const existingMembership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: user.id,
			},
		});

		if (existingMembership) {
			throw new Error(
				"Cet utilisateur est déjà membre de l'organisation"
			);
		}

		// Ajouter l'utilisateur comme membre
		return await prisma.organizationMember.create({
			data: {
				organizationId,
				userId: user.id,
				role,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'ajout du membre:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}

/**
 * Supprime un membre d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {string} memberId - ID du membre
 * @returns {Promise<boolean>} Succès de la suppression
 */
export async function removeOrganizationMember(organizationId, memberId) {
	try {
		if (!organizationId || !memberId) {
			throw new Error("IDs d'organisation et de membre requis");
		}

		// Vérifier si l'organisation existe
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			throw new Error("Organisation non trouvée");
		}

		// Vérifier si le membre existe
		const member = await prisma.organizationMember.findUnique({
			where: { id: memberId },
		});

		if (!member) {
			throw new Error("Membre non trouvé");
		}

		// Vérifier si le membre appartient à l'organisation
		if (member.organizationId !== organizationId) {
			throw new Error("Ce membre n'appartient pas à cette organisation");
		}

		// Vérifier si c'est le dernier OWNER
		if (member.role === "OWNER") {
			const ownersCount = await prisma.organizationMember.count({
				where: {
					organizationId,
					role: "OWNER",
				},
			});

			if (ownersCount <= 1) {
				throw new Error(
					"Impossible de supprimer le dernier propriétaire de l'organisation"
				);
			}
		}

		// Supprimer le membre
		await prisma.organizationMember.delete({
			where: { id: memberId },
		});

		return true;
	} catch (error) {
		console.error("Erreur lors de la suppression du membre:", error);
		throw new Error(`Erreur: ${error.message}`);
	}
}
