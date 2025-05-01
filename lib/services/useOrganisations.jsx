// services/organizationService.js
/**
 * Service pour la gestion des organisations
 * Contient toutes les méthodes pour interagir avec l'API des organisations
 */

/**
 * Récupère toutes les organisations
 * @returns {Promise<Array>} - Liste des organisations
 */
export async function fetchAllOrganizations() {
	try {
		const response = await fetch("/api/organizations");

		if (!response.ok) {
			throw new Error("Erreur lors du chargement des organisations");
		}

		const data = await response.json();
		return data.organizations || [];
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Récupère une organisation par son ID
 * @param {string} id - ID de l'organisation
 * @returns {Promise<Object>} - Détails de l'organisation
 */
export async function fetchOrganizationById(id) {
	if (!id) return null;

	try {
		const response = await fetch(`/api/organizations/${id}`);

		if (!response.ok) {
			throw new Error("Erreur lors de la récupération de l'organisation");
		}

		const data = await response.json();
		return data.organization;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Crée une nouvelle organisation
 * @param {Object} organizationData - Données de l'organisation
 * @returns {Promise<Object>} - Organisation créée
 */
export async function createOrganization(organizationData) {
	try {
		const response = await fetch("/api/organizations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(organizationData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erreur lors de la création");
		}

		const data = await response.json();
		return data.organization;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Met à jour une organisation existante
 * @param {string} id - ID de l'organisation
 * @param {Object} organizationData - Données mises à jour
 * @returns {Promise<Object>} - Organisation mise à jour
 */
export async function updateOrganization(id, organizationData) {
	try {
		const response = await fetch(`/api/organizations/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(organizationData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erreur lors de la mise à jour");
		}

		const data = await response.json();
		return data.organization;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Supprime une organisation
 * @param {string} id - ID de l'organisation
 * @returns {Promise<boolean>} - Statut de la suppression
 */
export async function deleteOrganization(id) {
	try {
		const response = await fetch(`/api/organizations/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erreur lors de la suppression");
		}

		return true;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Récupère les membres d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Array>} - Liste des membres
 */
export async function fetchOrganizationMembers(organizationId) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/members`
		);

		if (!response.ok) {
			throw new Error("Erreur lors de la récupération des membres");
		}

		const data = await response.json();
		return data.members || [];
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Ajoute un membre à une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {Object} memberData - Données du membre à ajouter
 * @returns {Promise<Object>} - Membre ajouté
 */
export async function addOrganizationMember(organizationId, memberData) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/members`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(memberData),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || "Erreur lors de l'ajout du membre"
			);
		}

		const data = await response.json();
		return data.member;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Supprime un membre d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {string} memberId - ID du membre
 * @returns {Promise<boolean>} - Statut de la suppression
 */
export async function removeOrganizationMember(organizationId, memberId) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/members/${memberId}`,
			{
				method: "DELETE",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || "Erreur lors de la suppression du membre"
			);
		}

		return true;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Récupère les formations associées à une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Array>} - Liste des formations
 */
export async function fetchOrganizationTrainings(organizationId) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/trainings`
		);

		if (!response.ok) {
			throw new Error("Erreur lors de la récupération des formations");
		}

		const data = await response.json();
		return data.trainings || [];
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Associe une formation à une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {string} courseId - ID de la formation
 * @param {string} buildId - ID du build (optionnel)
 * @returns {Promise<Object>} - Formation associée
 */
export async function associateTraining(
	organizationId,
	courseId,
	buildId = null
) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/trainings`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ courseId, buildId }),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error ||
					"Erreur lors de l'association de la formation"
			);
		}

		const data = await response.json();
		return data.training;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Supprime l'association d'une formation à une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {string} trainingId - ID de l'association
 * @returns {Promise<boolean>} - Statut de la suppression
 */
export async function removeTrainingAssociation(organizationId, trainingId) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/trainings/${trainingId}`,
			{
				method: "DELETE",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error ||
					"Erreur lors de la suppression de l'association"
			);
		}

		return true;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Récupère les builds d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Array>} - Liste des builds
 */
export async function fetchOrganizationBuilds(organizationId) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/builds`
		);

		if (!response.ok) {
			throw new Error("Erreur lors de la récupération des builds");
		}

		const data = await response.json();
		return data.builds || [];
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Récupère les builds non associés d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Array>} - Liste des builds non associés
 */
export async function fetchUnassignedBuilds(organizationId) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/builds/unassigned`
		);

		if (!response.ok) {
			throw new Error(
				"Erreur lors de la récupération des builds non associés"
			);
		}

		const data = await response.json();
		return data.builds || [];
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Récupère le nombre de builds d'une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<number>} - Nombre de builds
 */
export async function fetchBuildsCount(organizationId) {
	try {
		const response = await fetch(
			`/api/organizations/${organizationId}/builds/count`
		);

		if (!response.ok) {
			throw new Error(
				"Erreur lors de la récupération du nombre de builds"
			);
		}

		const data = await response.json();
		return data.count || 0;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Upload un build pour une organisation
 * @param {string} organizationId - ID de l'organisation
 * @param {FormData} formData - Données du formulaire d'upload
 * @returns {Promise<Object>} - Build uploadé
 */
export async function uploadBuild(organizationId, formData) {
	try {
		// Assurez-vous que l'ID de l'organisation est inclus dans formData
		formData.append("organizationId", organizationId);

		const response = await fetch("/api/organizations/builds/upload", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || "Erreur lors de l'upload du build"
			);
		}

		const data = await response.json();
		return data.build;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}

/**
 * Associe un build à une formation
 * @param {string} formationId - ID de la formation
 * @param {string} buildId - ID du build
 * @returns {Promise<boolean>} - Statut de l'association
 */
export async function associateBuildToFormation(formationId, buildId) {
	try {
		const response = await fetch(
			`/api/formations/${formationId}/assign-build`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ buildId }),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || "Erreur lors de l'association du build"
			);
		}

		const data = await response.json();
		return data.success;
	} catch (error) {
		console.error("OrganizationService Error:", error);
		throw error;
	}
}
