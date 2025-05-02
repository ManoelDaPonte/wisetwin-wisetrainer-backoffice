//app/formations/view/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CurrentFormationOverview from "@/components/formations/currentFormation/view/CurrentFormationOverview";
import CurrentFormation3DModules from "@/components/formations/currentFormation/view/CurrentFormation3DModules";
import CurrentFormationCourses from "@/components/formations/currentFormation/view/CurrentFormationCourses";
import CurrentFormationDocumentation from "@/components/formations/currentFormation/view/CurrentFormationDocumentation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormationDetails } from "@/lib/hooks/formations/currentFormation/useCurrentFormationDetails";

export default function ViewFormationPage() {
	const params = useParams();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");
	const [formationId, setFormationId] = useState(null);

	// Extraire l'ID de la formation des paramètres
	useEffect(() => {
		if (params?.id) {
			console.log("Formation ID from params:", params.id);
			setFormationId(params.id);
		}
	}, [params]);

	// Utilisation du hook personnalisé pour récupérer les détails de la formation
	const { formation, isLoading, error, refreshFormation } =
		useFormationDetails(formationId);

	const handleBack = () => {
		router.push("/formations");
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
								<p>ID de formation: {formationId}</p>
							</div>
						</AlertDescription>
					</Alert>
				) : formation ? (
					<div className="space-y-6">
						<CurrentFormationOverview formation={formation} />

						<Tabs
							defaultValue="overview"
							value={activeTab}
							onValueChange={setActiveTab}
						>
							<TabsList className="w-full">
								<TabsTrigger value="overview">
									Vue d'ensemble
								</TabsTrigger>
								<TabsTrigger value="3d">
									Modules 3D (
									{formation.builds3D?.length || 0})
								</TabsTrigger>
								<TabsTrigger value="courses">
									Cours ({formation.courses?.length || 0})
								</TabsTrigger>
								<TabsTrigger value="docs">
									Documentation (
									{formation.documentation?.length || 0})
								</TabsTrigger>
							</TabsList>

							<TabsContent
								value="overview"
								className="space-y-6 mt-6"
							>
								<CurrentFormation3DModules
									formation={formation}
									isPreview={true}
								/>
								<CurrentFormationCourses
									formation={formation}
									isPreview={true}
								/>
								<CurrentFormationDocumentation
									formation={formation}
									isPreview={true}
								/>
							</TabsContent>

							<TabsContent value="3d" className="mt-6">
								<CurrentFormation3DModules
									formation={formation}
								/>
							</TabsContent>

							<TabsContent value="courses" className="mt-6">
								<CurrentFormationCourses
									formation={formation}
								/>
							</TabsContent>

							<TabsContent value="docs" className="mt-6">
								<CurrentFormationDocumentation
									formation={formation}
								/>
							</TabsContent>
						</Tabs>
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
