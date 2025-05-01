// hooks/useOrganizationBuilds.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useOrganizationBuilds(organizationId) {
	const [builds, setBuilds] = useState([]);
	const [filteredBuilds, setFilteredBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchBuilds = useCallback(async () => {
		if (!organizationId) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/builds`
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la récupération des builds");
			}

			const data = await response.json();
			setBuilds(data.builds || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [organizationId]);

	useEffect(() => {
		fetchBuilds();
	}, [fetchBuilds]);

	// Filtrer les builds selon la recherche
	useEffect(() => {
		if (searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			const filtered = builds.filter(
				(build) =>
					build.name.toLowerCase().includes(query) ||
					(build.description &&
						build.description.toLowerCase().includes(query)) ||
					build.version.toLowerCase().includes(query)
			);
			setFilteredBuilds(filtered);
		} else {
			setFilteredBuilds(builds);
		}
	}, [builds, searchQuery]);

	// Fonction pour uploader un build
	const uploadBuild = async (formData) => {
		try {
			// Assurez-vous que organizationId est inclus dans formData
			formData.append("organizationId", organizationId);

			const response = await fetch("/api/organizations/builds/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Erreur lors de l'upload");
			}

			const data = await response.json();

			// Rafraîchir la liste des builds
			await fetchBuilds();

			return data.build;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return null;
		}
	};

	// Fonction pour associer un build à une formation
	const associateBuildToFormation = async (buildId, formationId) => {
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
					errorData.error || "Erreur lors de l'association"
				);
			}

			const data = await response.json();
			return data.success;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return false;
		}
	};

	return {
		builds: filteredBuilds,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
		refreshBuilds: fetchBuilds,
		uploadBuild,
		associateBuildToFormation,
	};
}
