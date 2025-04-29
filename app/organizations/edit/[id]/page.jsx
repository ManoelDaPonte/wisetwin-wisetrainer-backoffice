// app/organizations/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Save } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import OrganizationForm from "@/components/organizations/OrganizationForm";
import { useOrganizations } from "@/hooks/useOrganizations";

export default function EditOrganizationPage() {
	const params = useParams();
	const router = useRouter();
	const { organization, isLoading, error } = useOrganizations(params.id);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState(null);

	const handleBack = () => {
		router.push(`/organizations/${params.id}`);
	};

	const handleSave = async (formData) => {
		setIsSaving(true);
		setSaveError(null);

		try {
			const response = await fetch(`/api/organizations/${params.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de la mise à jour"
				);
			}

			// Redirection vers la page de détails
			router.push(`/organizations/${params.id}`);
		} catch (err) {
			console.error("Erreur:", err);
			setSaveError(err.message);
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
						Retour à l'organisation
					</Button>
				</div>

				<h1 className="text-2xl font-bold">Modifier l'organisation</h1>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : error ? (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : organization ? (
					<>
						{saveError && (
							<Alert variant="destructive">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>{saveError}</AlertDescription>
							</Alert>
						)}

						<OrganizationForm
							initialData={organization}
							onSubmit={handleSave}
							isSaving={isSaving}
						/>
					</>
				) : (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Organisation non trouvée
						</AlertDescription>
					</Alert>
				)}
			</div>
		</AdminLayout>
	);
}
