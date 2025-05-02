//app/formations/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Save } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormationForm from "@/components/formations/FormationForm";
import { useFormationDetails } from "@/lib/hooks/formations/currentFormation/useCurrentFormationDetails";
import { useFormationUpdate } from "@/lib/hooks/formations/currentFormation/useCurrentFormationUpdate";

export default function EditFormationPage() {
	const params = useParams();
	const router = useRouter();
	const { formation, isLoading, error, refreshFormation } =
		useFormationDetails(params.id);
	const { updateFormation, isUpdating, updateError } = useFormationUpdate();
	const [formSubmitted, setFormSubmitted] = useState(false);

	const handleBack = () => {
		router.push("/formations");
	};

	const handleUpdate = async (formData) => {
		const success = await updateFormation(params.id, formData);
		if (success) {
			setFormSubmitted(true);
			// Refresh the formation data
			refreshFormation();
			// Redirect to view page after brief delay
			setTimeout(() => {
				router.push(`/formations/view/${params.id}`);
			}, 1500);
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
					<>
						{updateError && (
							<Alert variant="destructive">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									{updateError}
								</AlertDescription>
							</Alert>
						)}

						{formSubmitted && (
							<Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
								<Save className="h-4 w-4" />
								<AlertDescription>
									Formation mise à jour avec succès !
									Redirection...
								</AlertDescription>
							</Alert>
						)}

						<FormationForm
							initialData={formation}
							onSubmit={handleUpdate}
							isSaving={isUpdating}
							isNew={false}
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
