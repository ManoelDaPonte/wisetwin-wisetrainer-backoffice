// app/formations/modules/edit/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Save } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleEditor from "@/components/formations/modules/ModuleEditor";

export default function EditModulePage() {
	const params = useParams();
	const router = useRouter();
	const [module, setModule] = useState(null);
	const [formationId, setFormationId] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("general");

	useEffect(() => {
		if (!params.id) return;

		const fetchModule = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Nous devons récupérer le formationId d'abord
				// Cette API retournera à la fois le module et son formationId parent
				const response = await fetch(`/api/modules/${params.id}`);

				if (!response.ok) {
					throw new Error("Erreur lors de la récupération du module");
				}

				const data = await response.json();
				setModule(data.module);
				setFormationId(data.module.formationId);
			} catch (err) {
				console.error("Erreur:", err);
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchModule();
	}, [params.id]);

	const handleBack = () => {
		// Retourner à la page des modules de la formation
		if (formationId) {
			router.push(`/formations/modules/${formationId}`);
		} else {
			router.push("/formations");
		}
	};

	const handleSave = async (moduleData) => {
		if (!params.id || !formationId) return;

		setIsSaving(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${formationId}/modules/${params.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(moduleData),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de la mise à jour du module"
				);
			}

			const data = await response.json();
			setModule(data.module);

			// Retourner à la page des modules après la sauvegarde réussie
			router.push(`/formations/modules/${formationId}`);
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
						Retour
					</Button>
				</div>

				<h1 className="text-2xl font-bold">Éditer le module</h1>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : error ? (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : module ? (
					<ModuleEditor
						module={module}
						formationId={formationId}
						onSave={handleSave}
						isSaving={isSaving}
					/>
				) : (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>Module non trouvé</AlertDescription>
					</Alert>
				)}
			</div>
		</AdminLayout>
	);
}
