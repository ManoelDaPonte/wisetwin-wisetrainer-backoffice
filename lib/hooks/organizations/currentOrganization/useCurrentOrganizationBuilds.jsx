// hooks/useOrganizationBuilds.js
"use client";

import { useState, useEffect } from "react";
import { fetchOrganizationBuilds } from "@/services/buildService";

export function useOrganizationBuilds(organizationId) {
	const [builds, setBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredBuilds, setFilteredBuilds] = useState([]);

	useEffect(() => {
		if (!organizationId) return;

		async function loadBuilds() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchOrganizationBuilds(organizationId);
				setBuilds(data);
				setFilteredBuilds(data);
			} catch (err) {
				console.error("Erreur:", err);
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		}

		loadBuilds();
	}, [organizationId]);

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

	return {
		builds: filteredBuilds,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
	};
}
