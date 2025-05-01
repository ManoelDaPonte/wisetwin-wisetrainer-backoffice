//lib/hooks/organizations/currentOrganization/useCurrentOrganization.js
"use client";

import { useState, useEffect, useCallback } from "react";

export function useCurrentOrganization(organizationId) {
	const [organization, setOrganization] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchOrganization = useCallback(async () => {
		if (!organizationId) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}`
			);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération de l'organisation"
				);
			}

			const data = await response.json();
			setOrganization(data.organization);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [organizationId]);

	useEffect(() => {
		fetchOrganization();
	}, [fetchOrganization]);

	return {
		organization,
		isLoading,
		error,
		refreshOrganization: fetchOrganization,
	};
}
