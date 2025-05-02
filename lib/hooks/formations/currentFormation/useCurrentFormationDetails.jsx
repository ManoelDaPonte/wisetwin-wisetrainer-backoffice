//lib/hooks/formations/currentFormation/useCurrentFormationDetails.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook pour récupérer les détails d'une formation
 * @param {string} formationId - ID de la formation à récupérer
 * @returns {Object} { formation, isLoading, error, refreshFormation }
 */
export function useFormationDetails(formationId) {
	const [formation, setFormation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchFormation = useCallback(async () => {
		if (!formationId) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			console.log(`Fetching formation with ID: ${formationId}`);
			const response = await fetch(`/api/formations/${formationId}`);

			if (!response.ok) {
				// Essayer d'obtenir plus d'informations sur l'erreur
				let errorMessage = `Erreur lors de la récupération de la formation: ${response.status}`;
				try {
					const errorData = await response.json();
					if (errorData && errorData.error) {
						errorMessage = errorData.error;
					}
				} catch (parseError) {
					console.error(
						"Erreur lors du parsing de la réponse d'erreur:",
						parseError
					);
				}

				throw new Error(errorMessage);
			}

			const data = await response.json();
			console.log("Formation data received:", data);
			setFormation(data.formation);
		} catch (err) {
			console.error(
				"Erreur lors de la récupération de la formation:",
				err
			);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [formationId]);

	useEffect(() => {
		fetchFormation();
	}, [fetchFormation]);

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
