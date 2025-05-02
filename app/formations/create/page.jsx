//app/formations/create/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormationForm from "@/components/formations/FormationForm";
import { DEFAULT_FORMATION } from "@/lib/config/formations";

export default function CreateFormationPage() {
	const router = useRouter();
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	const handleBack = () => {
		router.push("/formations");
	};

	const handleCreate = async (formData) => {
		setIsSaving(true);
		setError(null);

		try {
			const response = await fetch("/api/formations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error ||
						"Erreur lors de la création de la formation"
				);
			}

			const data = await response.json();

			// Création réussie, redirection vers la page de détails de la formation
			router.push(`/formations/${data.formation.id}`);
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

				<h1 className="text-2xl font-bold">
					Créer une nouvelle formation
				</h1>

				{error && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<FormationForm
					initialData={DEFAULT_FORMATION}
					onSubmit={handleCreate}
					isSaving={isSaving}
					isNew={true}
				/>
			</div>
		</AdminLayout>
	);
}
