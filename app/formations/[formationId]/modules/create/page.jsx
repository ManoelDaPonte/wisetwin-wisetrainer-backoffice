// app/formations/[formationId]/modules/create/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ModuleForm from "@/components/formations/modules/ModuleForm";

export default function CreateModulePage() {
	const params = useParams();
	const router = useRouter();
	const [formation, setFormation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!params.formationId) return;

		const fetchFormation = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch(
					`/api/formations/${params.formationId}`
				);

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
	}, [params.formationId]);

	const handleBack = () => {
		router.push(`/formations/${params.formationId}/modules`);
	};

	const handleCreateModule = async (moduleData) => {
		setIsSaving(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${params.formationId}/modules`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(moduleData),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de la création du module"
				);
			}

			const data = await response.json();

			// Redirection vers la page d'édition du module
			router.push(
				`/formations/${params.formationId}/modules/${data.module.id}`
			);
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
						Retour aux modules
					</Button>
				</div>

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
					<>
						<div>
							<h1 className="text-2xl font-bold">
								Ajouter un module
							</h1>
							<p className="text-muted-foreground">
								Créer un nouveau module pour la formation "
								{formation.name}"
							</p>
						</div>

						<ModuleForm
							formationId={params.formationId}
							onSubmit={handleCreateModule}
							isSaving={isSaving}
							isNew={true}
						/>
					</>
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
