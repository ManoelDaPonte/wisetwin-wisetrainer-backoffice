//lib/hooks/formations/useFormations.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useFormations(options = {}) {
	const {
		initialFilters = {},
		initialSort = { key: "name", direction: "asc" },
	} = options;

	const [formations, setFormations] = useState([]);
	const [filteredFormations, setFilteredFormations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortConfig, setSortConfig] = useState(initialSort);
	const [filters, setFilters] = useState(initialFilters);

	// Fonction pour charger les formations
	const fetchFormations = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();

			// Ajouter les paramètres de tri
			if (sortConfig.key) {
				params.append("sortBy", sortConfig.key);
				params.append("sortDirection", sortConfig.direction);
			}

			// Ajouter les filtres
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					params.append(key, value);
				}
			});

			const response = await fetch(
				`/api/formations?${params.toString()}`
			);

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
	}, [sortConfig, filters]);

	// Charger les formations au montage du composant ou lorsque les paramètres changent
	useEffect(() => {
		fetchFormations();
	}, [fetchFormations]);

	// Filtrer les formations par recherche
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredFormations(formations);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = formations.filter(
			(formation) =>
				formation.name.toLowerCase().includes(query) ||
				(formation.description &&
					formation.description.toLowerCase().includes(query)) ||
				(formation.category &&
					formation.category.toLowerCase().includes(query))
		);

		setFilteredFormations(filtered);
	}, [formations, searchQuery]);

	// Fonction pour mettre à jour la recherche
	const handleSearch = (query) => {
		setSearchQuery(query);
	};

	// Fonction pour changer le tri
	const handleSort = (key) => {
		setSortConfig((prev) => ({
			key,
			direction:
				prev.key === key && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	// Fonction pour appliquer un filtre
	const handleFilter = (filterKey, value) => {
		setFilters((prev) => ({
			...prev,
			[filterKey]: value,
		}));
	};

	return {
		formations: filteredFormations,
		isLoading,
		error,
		searchQuery,
		sortConfig,
		filters,
		handleSearch,
		handleSort,
		handleFilter,
		refreshFormations: fetchFormations,
	};
}
