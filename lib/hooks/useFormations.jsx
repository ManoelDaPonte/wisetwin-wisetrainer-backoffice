// hooks/useFormations.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useFormations(options = {}) {
	const {
		initialSearch = "",
		sortBy = "updatedAt",
		sortDirection = "desc",
	} = options;

	const [formations, setFormations] = useState([]);
	const [filteredFormations, setFilteredFormations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState(initialSearch);
	const [sortConfig, setSortConfig] = useState({
		key: sortBy,
		direction: sortDirection,
	});

	// Fonction pour charger les formations
	const fetchFormations = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/formations");

			if (!response.ok) {
				throw new Error("Erreur lors du chargement des formations");
			}

			const data = await response.json();
			setFormations(data.formations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Charger les formations au montage du composant
	useEffect(() => {
		fetchFormations();
	}, [fetchFormations]);

	// Filtrer et trier les formations lorsque les formations, la recherche ou le tri changent
	useEffect(() => {
		// Filtrer les formations selon la recherche
		let result = [...formations];

		if (searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(formation) =>
					formation.name.toLowerCase().includes(query) ||
					formation.description.toLowerCase().includes(query) ||
					formation.formationId.toLowerCase().includes(query) ||
					formation.category.toLowerCase().includes(query)
			);
		}

		// Trier les formations
		result.sort((a, b) => {
			const key = sortConfig.key;

			// Vérifier si la propriété existe et est une date
			if (key.endsWith("At") && a[key] && b[key]) {
				const dateA = new Date(a[key]);
				const dateB = new Date(b[key]);

				return sortConfig.direction === "asc"
					? dateA - dateB
					: dateB - dateA;
			}

			// Tri normal pour les chaînes ou nombres
			if (a[key] < b[key]) {
				return sortConfig.direction === "asc" ? -1 : 1;
			}
			if (a[key] > b[key]) {
				return sortConfig.direction === "asc" ? 1 : -1;
			}
			return 0;
		});

		setFilteredFormations(result);
	}, [formations, searchQuery, sortConfig]);

	// Fonction pour mettre à jour la recherche
	const handleSearch = (query) => {
		setSearchQuery(query);
	};

	// Fonction pour changer le tri
	const handleSort = (key) => {
		setSortConfig((prev) => ({
			key,
			direction:
				prev.key === key
					? prev.direction === "asc"
						? "desc"
						: "asc"
					: "asc",
		}));
	};

	// Fonction pour supprimer une formation
	const handleDelete = async (id) => {
		if (
			!window.confirm(
				"Êtes-vous sûr de vouloir supprimer cette formation ?"
			)
		) {
			return false;
		}

		try {
			const response = await fetch(`/api/formations/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression");
			}

			// Mettre à jour la liste
			await fetchFormations();
			return true;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return false;
		}
	};

	// Fonction pour dupliquer une formation
	const handleDuplicate = async (id) => {
		try {
			const response = await fetch(`/api/formations/duplicate/${id}`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la duplication");
			}

			const data = await response.json();

			// Mettre à jour la liste
			await fetchFormations();
			return data.id;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return null;
		}
	};

	return {
		formations: filteredFormations,
		isLoading,
		error,
		searchQuery,
		sortConfig,
		handleSearch,
		handleSort,
		handleDelete,
		handleDuplicate,
		refreshFormations: fetchFormations,
	};
}

export function useFormation(id) {
	const [formation, setFormation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchFormation = useCallback(async () => {
		if (!id) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/formations/${id}`);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération de la formation"
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
	}, [id]);

	useEffect(() => {
		fetchFormation();
	}, [fetchFormation]);

	const updateFormation = async (formData) => {
		if (!id) return null;

		try {
			const response = await fetch(`/api/formations/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de la mise à jour"
				);
			}

			const data = await response.json();

			// Mettre à jour l'état local
			setFormation(data.formation);

			return data.formation;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return null;
		}
	};

	return {
		formation,
		isLoading,
		error,
		refreshFormation: fetchFormation,
		updateFormation,
	};
}
