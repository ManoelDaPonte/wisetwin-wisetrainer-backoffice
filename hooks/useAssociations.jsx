// hooks/useAssociations.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useAssociations(options = {}) {
	const { initialFilter = "all" } = options;

	const [associations, setAssociations] = useState([]);
	const [filteredAssociations, setFilteredAssociations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState(initialFilter);

	const fetchAssociations = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/associations");

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des associations"
				);
			}

			const data = await response.json();
			setAssociations(data.associations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Filtrer les associations
	useEffect(() => {
		let filtered = [...associations];

		// Appliquer le filtre de type
		if (filterType === "with-build") {
			filtered = filtered.filter((assoc) => assoc.buildId);
		} else if (filterType === "without-build") {
			filtered = filtered.filter((assoc) => !assoc.buildId);
		}

		// Appliquer la recherche
		if (searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(assoc) =>
					assoc.name.toLowerCase().includes(query) ||
					assoc.formationId.toLowerCase().includes(query) ||
					(assoc.buildName &&
						assoc.buildName.toLowerCase().includes(query)) ||
					(assoc.category &&
						assoc.category.toLowerCase().includes(query))
			);
		}

		setFilteredAssociations(filtered);
	}, [associations, searchQuery, filterType]);

	// Charger les associations au montage du composant
	useEffect(() => {
		fetchAssociations();
	}, [fetchAssociations]);

	const removeAssociation = async (formationId) => {
		if (
			!confirm("Êtes-vous sûr de vouloir supprimer cette association ?")
		) {
			return false;
		}

		setIsProcessing(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${formationId}/assign-build`,
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

			// Rafraîchir la liste des associations
			await fetchAssociations();
			return true;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return false;
		} finally {
			setIsProcessing(false);
		}
	};

	const createAssociation = async (formationId, buildId) => {
		setIsProcessing(true);
		setError(null);

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

			// Rafraîchir la liste des associations
			await fetchAssociations();
			return true;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return false;
		} finally {
			setIsProcessing(false);
		}
	};

	return {
		associations: filteredAssociations,
		isLoading,
		isProcessing,
		error,
		searchQuery,
		setSearchQuery,
		filterType,
		setFilterType,
		refreshAssociations: fetchAssociations,
		removeAssociation,
		createAssociation,
	};
}
