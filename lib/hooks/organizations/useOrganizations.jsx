// hooks/useOrganizations.js
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

	// Fonction pour charger une organisation spécifique par ID
	const fetchOrganization = useCallback(async () => {
		if (!id) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/organizations/${id}`);

			if (!response.ok) {
				throw new Error("Erreur lors du chargement de l'organisation");
			}

			const data = await response.json();
			setOrganization(data.organization);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	// Chargement initial des données
	useEffect(() => {
		if (id) {
			fetchOrganization();
		} else {
			fetchOrganizations();
		}
	}, [id, fetchOrganization, fetchOrganizations]);

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

	// Mettre à jour une organisation
	const updateOrganization = async (organizationData) => {
		if (!id) return null;

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
				throw new Error(
					errorData.error || "Erreur lors de la mise à jour"
				);
			}

			const data = await response.json();
			setOrganization(data.organization);

			return data.organization;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return null;
		}
	};

	// Supprimer une organisation
	const deleteOrganization = async (organizationId) => {
		try {
			const response = await fetch(
				`/api/organizations/${organizationId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de la suppression"
				);
			}

			// Rafraîchir la liste si nous sommes sur la page de liste
			if (!id) {
				await fetchOrganizations();
			}

			return true;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return false;
		}
	};

	return {
		organizations: filteredOrganizations,
		organization,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
		refreshOrganizations: fetchOrganizations,
		refreshOrganization: fetchOrganization,
		createOrganization,
		updateOrganization,
		deleteOrganization,
	};
}
