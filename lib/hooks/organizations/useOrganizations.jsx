//lib/hooks/organizations/useOrganizations.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useOrganizations() {
	const [organizations, setOrganizations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

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

	useEffect(() => {
		fetchOrganizations();
	}, [fetchOrganizations]);

	return {
		organizations,
		isLoading,
		error,
		refreshOrganizations: fetchOrganizations,
	};
}
