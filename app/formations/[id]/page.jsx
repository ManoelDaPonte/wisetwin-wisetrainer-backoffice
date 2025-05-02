//app/formations/[id]/page.jsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CurrentFormationOverview from "@/components/formations/currentFormation/view/CurrentFormationOverview";
import CurrentFormation3DModules from "@/components/formations/currentFormation/view/CurrentFormation3DModules";
import CurrentFormationCourses from "@/components/formations/currentFormation/view/CurrentFormationCourses";
import CurrentFormationDocumentation from "@/components/formations/currentFormation/view/CurrentFormationDocumentation";
import CurrentFormationDeleteSection from "@/components/formations/currentFormation/view/CurrentFormationDeleteSection";
import { useFormationDetails } from "@/lib/hooks/formations/currentFormation/useCurrentFormationDetails";
import { useFormationActions } from "@/lib/hooks/formations/currentFormation/useCurrentFormationActions";

export default function FormationDetailsPage() {
	const params = useParams();
	const router = useRouter();

	// Utilisation des hooks personnalisés
	const { formation, isLoading, error, refreshFormation } =
		useFormationDetails(params.id);
	const { deleteFormation } = useFormationActions(params.id);

	const handleBack = () => {
		router.push("/formations");
	};
	
	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour aux formations
					</Button>
				</div>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : error ? (
					<Alert variant="destructive">
						<AlertTitle>Erreur</AlertTitle>
						<AlertDescription className="flex flex-col gap-3">
							<div className="flex items-center">
								<AlertTriangle className="h-4 w-4 mr-2" />
								{error}
							</div>

							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={refreshFormation}
								>
									<RefreshCcw className="h-4 w-4 mr-2" />
									Réessayer
								</Button>

								<Button
									variant="outline"
									size="sm"
									onClick={handleBack}
								>
									Retour aux formations
								</Button>
							</div>

							<div className="text-sm mt-2">
								<p>Informations de débogage:</p>
								<p>ID de formation: {params.id}</p>
							</div>
						</AlertDescription>
					</Alert>
				) : formation ? (
					<div className="space-y-6">
						<CurrentFormationOverview formation={formation} />

						<div className="space-y-8 mt-6">
							<div>
								<h2 className="text-xl font-semibold mb-4">Cours 3D ({formation.builds3D?.length || 0})</h2>
								<CurrentFormation3DModules
									formation={formation}
								/>
							</div>
							
							<div>
								<h2 className="text-xl font-semibold mb-4">Cours ({formation.courses?.length || 0})</h2>
								<CurrentFormationCourses
									formation={formation}
								/>
							</div>
							
							<div>
								<h2 className="text-xl font-semibold mb-4">Documentation ({formation.documentation?.length || 0})</h2>
								<CurrentFormationDocumentation
									formation={formation}
								/>
							</div>
						</div>

						{/* Ajouter la section de suppression */}
						<div className="pt-8 mt-8 border-t">
							<CurrentFormationDeleteSection
								formation={formation}
								onDelete={deleteFormation}
							/>
						</div>
					</div>
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