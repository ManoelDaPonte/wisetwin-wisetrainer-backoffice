// hooks/useOrganizationDetails.js
"use client";

import { useState, useEffect } from "react";
import { fetchOrganizationById } from "@/services/organizationService";

export function useOrganizationDetails(id) {
	const [organization, setOrganization] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!id) return;

		async function loadOrganization() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchOrganizationById(id);
				setOrganization(data);
			} catch (err) {
				console.error("Erreur:", err);
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		}

		loadOrganization();
	}, [id]);

	return {
		organization,
		isLoading,
		error,
	};
}
