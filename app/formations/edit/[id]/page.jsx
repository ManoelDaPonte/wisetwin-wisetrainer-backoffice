// app/formations/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Save } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormationForm from "@/components/formations/FormationForm";

export default function EditFormationPage() {
	const params = useParams();
	const router = useRouter();
	const [formation, setFormation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!params.id) return;

		const fetchFormation = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(`/api/formations/${params.id}`);

				if (!response.ok) {
					throw new Error(
						"Erreur lors de la récupération de la formation"
					);
				}

				const data = await response.json();
				setFormation(data.formation);
			} catch (err) {
				console.error("Erreur:", err);
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchFormation();
	}, [params.id]);

	const handleBack = () => {
		router.push("/formations");
	};

	const handleSave = async (formData) => {
		setIsSaving(true);
		setError(null);

		try {
			const response = await fetch(`/api/formations/${params.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error ||
						"Erreur lors de la mise à jour de la formation"
				);
			}

			const data = await response.json();

			// Mise à jour réussie
			setFormation(data.formation);

			// Redirection vers la page de visualisation
			router.push(`/formations/view/${params.id}`);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour aux formations
					</Button>
				</div>

				<h1 className="text-2xl font-bold">Modifier la formation</h1>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : error ? (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : formation ? (
					<FormationForm
						initialData={formation}
						onSubmit={handleSave}
						isSaving={isSaving}
					/>
				) : (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Formation non trouvée
						</AlertDescription>
					</Alert>
				)}
			</div>
		</AdminLayout>
	);
}
