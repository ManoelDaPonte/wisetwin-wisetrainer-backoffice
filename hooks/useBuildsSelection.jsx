// hooks/useBuildsSelection.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export function useBuildsSelection(currentBuildId = null) {
	const [builds, setBuilds] = useState([]);
	const [filteredBuilds, setFilteredBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedBuildId, setSelectedBuildId] = useState(
		currentBuildId || ""
	);
	const [isProcessing, setIsProcessing] = useState(false);

	const fetchBuilds = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/builds");

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
	}, []);

	// Filtrer les builds en fonction de la recherche
	useEffect(() => {
		if (builds.length > 0 && searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			const filtered = builds.filter(
				(build) =>
					build.name.toLowerCase().includes(query) ||
					build.containerName.toLowerCase().includes(query) ||
					build.internalId.toLowerCase().includes(query)
			);
			setFilteredBuilds(filtered);
		} else {
			setFilteredBuilds(builds);
		}
	}, [builds, searchQuery]);

	// Récupérer les informations sur le build actuellement sélectionné
	const currentBuild = useCallback(() => {
		if (!selectedBuildId) return null;
		return builds.find((b) => b.internalId === selectedBuildId);
	}, [builds, selectedBuildId]);

	const groupedBuilds = useMemo(() => {
		// Regrouper les builds par identifiant
		const groupsMap = {};
		builds.forEach((build) => {
			const buildId = build.internalId;
			if (!groupsMap[buildId]) {
				groupsMap[buildId] = {
					...build,
					containers: [build.containerName],
				};
			} else {
				groupsMap[buildId].containers.push(build.containerName);
			}
		});

		// Convertir l'objet en tableau
		return Object.values(groupsMap);
	}, [builds]);

	return {
		builds: filteredBuilds,
		groupedBuilds,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
		selectedBuildId,
		setSelectedBuildId,
		isProcessing,
		setIsProcessing,
		fetchBuilds,
		currentBuild: currentBuild(),
	};
}
