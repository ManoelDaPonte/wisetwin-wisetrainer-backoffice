// app/formations/view/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle, Edit } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormationViewDetails from "@/components/formations/FormationViewDetails";
import FormationContentsList from "@/components/formations/FormationContentsList";
import BuildSelector from "@/components/formations/BuildSelector";

export default function ViewFormationPage() {
	const params = useParams();
	const router = useRouter();
	const [formation, setFormation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!params.id) return;

		fetchFormation();
	}, [params.id]);

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

	const handleBack = () => {
		router.push("/formations");
	};

	const handleEdit = () => {
		router.push(`/formations/edit/${params.id}`);
	};

	const handleBuildAssigned = (buildId) => {
		setFormation((prev) => ({
			...prev,
			buildId: buildId,
		}));
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour aux formations
					</Button>

					{formation && (
						<Button onClick={handleEdit}>
							<Edit className="mr-2 h-4 w-4" />
							Modifier
						</Button>
					)}
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
					<div className="space-y-8">
						<FormationViewDetails formation={formation} />

						{/* Intégration du sélecteur de build */}
						<div className="border rounded-lg p-6 bg-card">
							<h2 className="text-xl font-semibold mb-4">
								Association aux builds Unity
							</h2>
							<BuildSelector
								formationId={formation.id}
								currentBuildId={formation.buildId}
								onAssign={handleBuildAssigned}
							/>
						</div>

						<FormationContentsList contents={formation.contents} />
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
