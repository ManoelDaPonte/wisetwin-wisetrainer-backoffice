//lib/hooks/builds/useOrganizationBuilds.js
"use client";

import { useState, useEffect, useCallback } from "react";

export function useOrganizationBuilds(organizationId) {
	const [builds, setBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

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

	const uploadBuild = async (files, metadata) => {
		setIsUploading(true);
		setUploadProgress(0);
		setError(null);

		try {
			const formData = new FormData();

			// Ajouter les fichiers
			files.forEach((file) => {
				formData.append("file", file);
			});

			// Ajouter les métadonnées
			Object.entries(metadata).forEach(([key, value]) => {
				formData.append(key, value);
			});

			const response = await fetch(
				`/api/organizations/${organizationId}/builds/upload`,
				{
					method: "POST",
					body: formData,
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Erreur lors de l'upload");
			}

			const data = await response.json();

			// Rafraîchir la liste
			await fetchBuilds();

			return data.build;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			throw err;
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	return {
		builds,
		isLoading,
		error,
		uploadProgress,
		isUploading,
		uploadBuild,
		refreshBuilds: fetchBuilds,
	};
}
