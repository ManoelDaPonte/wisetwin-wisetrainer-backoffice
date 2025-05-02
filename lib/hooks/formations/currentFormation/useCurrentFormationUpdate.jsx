//lib/hooks/formations/currentFormation/useCurrentFormationUpdate.jsx
"use client";

import { useState } from "react";

export function useFormationUpdate() {
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateError, setUpdateError] = useState(null);

	/**
	 * Met à jour une formation existante
	 * @param {string} formationId - ID de la formation à mettre à jour
	 * @param {Object} formData - Données mises à jour
	 * @returns {Promise<boolean>} True si la mise à jour est réussie
	 */
	const updateFormation = async (formationId, formData) => {
		setIsUpdating(true);
		setUpdateError(null);

		try {
			const response = await fetch(`/api/formations/${formationId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error ||
						"Erreur lors de la mise à jour de la formation"
				);
			}

			const data = await response.json();
			return true;
		} catch (err) {
			console.error("Erreur lors de la mise à jour:", err);
			setUpdateError(err.message);
			return false;
		} finally {
			setIsUpdating(false);
		}
	};

	return {
		updateFormation,
		isUpdating,
		updateError,
	};
}
