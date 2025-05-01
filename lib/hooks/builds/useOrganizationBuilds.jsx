//lib/hooks/builds/useOrganizationBuilds.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function useOrganizationBuilds(organizationId) {
	const [builds, setBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	const fetchBuilds = useCallback(async () => {
		if (!organizationId) {
			setBuilds([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			console.log("Fetching builds for organization:", organizationId);
			const response = await fetch(
				`/api/organizations/${organizationId}/builds`
			);

			if (!response.ok) {
				// Essayer d'extraire l'erreur plus détaillée du serveur
				let errorMessage = "Erreur lors de la récupération des builds";
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch (e) {
					console.error("Erreur lors du parsing de la réponse:", e);
				}

				throw new Error(errorMessage);
			}

			const data = await response.json();
			console.log("Builds received:", data); // Debug

			setBuilds(data.builds || []);
		} catch (err) {
			console.error("Erreur détaillée:", err);
			setError(err.message);
			// En cas d'erreur, on met des données par défaut pour ne pas casser l'UI
			setBuilds([]);
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

			console.log(
				"Uploading build to:",
				`/api/organizations/${organizationId}/builds/upload`
			);

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
			console.error("Erreur d'upload:", err);
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
