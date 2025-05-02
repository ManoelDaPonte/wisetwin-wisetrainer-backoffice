//lib/hooks/formations/useFormationDetails.jsx
"use client";

import { useState, useEffect } from "react";

/**
 * Hook pour récupérer les détails d'une formation
 * @param {string} formationId - ID de la formation à récupérer
 * @returns {Object} { formation, isLoading, error, refreshFormation }
 */
export function useFormationDetails(formationId) {
	const [formation, setFormation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchFormation = async () => {
		if (!formationId) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/formations/${formationId}`);

			if (!response.ok) {
				throw new Error(
					`Erreur lors de la récupération de la formation: ${response.status}`
				);
			}

			const data = await response.json();
			setFormation(data.formation);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchFormation();
	}, [formationId]);

	// Fonction pour rafraîchir manuellement les données
	const refreshFormation = () => {
		fetchFormation();
	};

	return {
		formation,
		isLoading,
		error,
		refreshFormation,
	};
}
