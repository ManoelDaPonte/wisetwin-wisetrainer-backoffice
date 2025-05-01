//lib/hooks/organizations/useOrganizations.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useOrganizations(id = null) {
	const [organizations, setOrganizations] = useState([]);
	const [organization, setOrganization] = useState(null);
	const [filteredOrganizations, setFilteredOrganizations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	// Fonction pour charger toutes les organisations
	const fetchOrganizations = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/organizations");

			if (!response.ok) {
				throw new Error("Erreur lors du chargement des organisations");
			}

			const data = await response.json();
			setOrganizations(data.organizations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Chargement initial des données
	useEffect(() => {
		if (!id) {
			fetchOrganizations();
		}
	}, [id, fetchOrganizations]);

	// Filtrer les organisations selon la recherche
	useEffect(() => {
		if (searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			const filtered = organizations.filter(
				(org) =>
					org.name.toLowerCase().includes(query) ||
					(org.description &&
						org.description.toLowerCase().includes(query))
			);
			setFilteredOrganizations(filtered);
		} else {
			setFilteredOrganizations(organizations);
		}
	}, [organizations, searchQuery]);

	return {
		organizations: filteredOrganizations,
		organization,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
		refreshOrganizations: fetchOrganizations,
	};
}
