// app/formations/modules/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Plus } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModulesManager from "@/components/formations/ModulesManager";
import { useFormation } from "@/hooks/useFormations";

export default function FormationModulesPage() {
	const params = useParams();
	const router = useRouter();
	const { formation, isLoading, error, refreshFormation } = useFormation(
		params.id
	);
	const [activeTab, setActiveTab] = useState("modules");

	const handleBack = () => {
		router.push(`/formations/edit/${params.id}`);
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour à l'édition
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
								{formation.name}
							</h1>
							<p className="text-muted-foreground">
								Gestion des modules et du contenu
							</p>
						</div>

						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
							<TabsList>
								<TabsTrigger value="modules">
									Modules
								</TabsTrigger>
								<TabsTrigger value="sequence">
									Séquence
								</TabsTrigger>
								<TabsTrigger value="preview">
									Prévisualisation
								</TabsTrigger>
							</TabsList>

							<TabsContent value="modules" className="mt-6">
								<ModulesManager
									formation={formation}
									onUpdate={refreshFormation}
								/>
							</TabsContent>

							<TabsContent value="sequence" className="mt-6">
								<div className="flex items-center justify-center h-40 border rounded-md bg-muted/20">
									<p className="text-muted-foreground">
										Éditeur de séquence - à implémenter
									</p>
								</div>
							</TabsContent>

							<TabsContent value="preview" className="mt-6">
								<div className="flex items-center justify-center h-40 border rounded-md bg-muted/20">
									<p className="text-muted-foreground">
										Prévisualisation - à implémenter
									</p>
								</div>
							</TabsContent>
						</Tabs>
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
