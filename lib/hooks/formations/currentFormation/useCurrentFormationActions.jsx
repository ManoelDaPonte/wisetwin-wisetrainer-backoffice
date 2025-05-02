//lib/hooks/formations/currentFormation/useCurrentFormationActions.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useFormationActions(formationId) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fonction pour exporter la formation au format JSON
	const exportFormation = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/export/${formationId}`
			);

			if (!response.ok) {
				throw new Error("Erreur lors de l'exportation de la formation");
			}

			const data = await response.json();

			// Créer un Blob et le télécharger
			const blob = new Blob([JSON.stringify(data.formation, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `formation-${
				data.formation.externalId || formationId
			}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			return true;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	// Fonction pour dupliquer la formation
	const duplicateFormation = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/duplicate/${formationId}`,
				{
					method: "POST",
				}
			);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la duplication de la formation"
				);
			}

			const data = await response.json();

			// Rediriger vers la nouvelle formation
			router.push(`/formations/view/${data.formation.id}`);

			return data.formation;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Fonction pour supprimer la formation
	const deleteFormation = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/formations/${formationId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la suppression de la formation"
				);
			}

			// Rediriger vers la liste des formations
			router.push("/formations");

			return true;
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		exportFormation,
		duplicateFormation,
		deleteFormation,
		isLoading,
		error,
	};
}
