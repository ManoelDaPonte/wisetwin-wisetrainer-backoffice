//app/formations/view/[id]/page.jsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormationOverview from "@/components/formations/view/FormationOverview";
import Formation3DModules from "@/components/formations/view/Formation3DModules";
import FormationCourses from "@/components/formations/view/FormationCourses";
import FormationDocumentation from "@/components/formations/view/FormationDocumentation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormationDetails } from "@/lib/hooks/formations/currentFormation/useCurrentFormationDetails";

export default function ViewFormationPage() {
	const params = useParams();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");

	// Utilisation du hook personnalisé pour récupérer les détails de la formation
	const { formation, isLoading, error, refreshFormation } =
		useFormationDetails(params.id);

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
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : formation ? (
					<div className="space-y-6">
						<FormationOverview formation={formation} />

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
								<Formation3DModules
									formation={formation}
									isPreview={true}
								/>
								<FormationCourses
									formation={formation}
									isPreview={true}
								/>
								<FormationDocumentation
									formation={formation}
									isPreview={true}
								/>
							</TabsContent>

							<TabsContent value="3d" className="mt-6">
								<Formation3DModules formation={formation} />
							</TabsContent>

							<TabsContent value="courses" className="mt-6">
								<FormationCourses formation={formation} />
							</TabsContent>

							<TabsContent value="docs" className="mt-6">
								<FormationDocumentation formation={formation} />
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
