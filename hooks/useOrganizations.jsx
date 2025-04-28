// hooks/useOrganizations.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useOrganizations() {
	const [organizations, setOrganizations] = useState([]);
	const [filteredOrganizations, setFilteredOrganizations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

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

	// Charger les organisations au montage du composant
	useEffect(() => {
		fetchOrganizations();
	}, [fetchOrganizations]);

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

	// Créer une nouvelle organisation
	const createOrganization = async (organizationData) => {
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
				throw new Error(
					errorData.error || "Erreur lors de la création"
				);
			}

			const data = await response.json();

			// Rafraîchir la liste
			await fetchOrganizations();

			return data.organization;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return null;
		}
	};

	return {
		organizations: filteredOrganizations,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
		refreshOrganizations: fetchOrganizations,
		createOrganization,
	};
}
