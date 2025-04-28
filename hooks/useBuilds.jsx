// hooks/useBuilds.js
"use client";

import { useState, useEffect } from "react";

export function useBuilds(container = null) {
	const [builds, setBuilds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchBuilds() {
			setLoading(true);
			setError(null);
			try {
				const url = container
					? `/api/builds?container=${encodeURIComponent(container)}`
					: "/api/builds";

				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(`Erreur HTTP: ${response.status}`);
				}

				const data = await response.json();
				setBuilds(data.builds || []);
			} catch (err) {
				console.error(
					"Erreur lors de la récupération des builds:",
					err
				);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchBuilds();
	}, [container]);

	return { builds, loading, error };
}

export function useBuildDetails(container, blob) {
	const [build, setBuild] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!container || !blob) {
			setLoading(false);
			return;
		}

		async function fetchBuildDetails() {
			setLoading(true);
			setError(null);
			try {
				const encodedBlob = encodeURIComponent(blob);
				const response = await fetch(
					`/api/builds/${container}/${encodedBlob}`
				);

				if (!response.ok) {
					throw new Error(`Erreur HTTP: ${response.status}`);
				}

				const data = await response.json();
				setBuild(data.build);
			} catch (err) {
				console.error(
					"Erreur lors de la récupération des détails du build:",
					err
				);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchBuildDetails();
	}, [container, blob]);

	return { build, loading, error };
}
