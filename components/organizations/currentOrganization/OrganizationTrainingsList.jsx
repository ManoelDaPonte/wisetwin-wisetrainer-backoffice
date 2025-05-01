// components/organizations/OrganizationTrainingsList.jsx
"use client";

import { useState } from "react";
import {
	BookOpen,
	Plus,
	Eye,
	Trash,
	Loader2,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function OrganizationTrainingsList({
	organizationId,
	trainings = [],
}) {
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [selectedTraining, setSelectedTraining] = useState(null);
	const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState(null);
	const [availableFormations, setAvailableFormations] = useState([]);
	const [isLoadingFormations, setIsLoadingFormations] = useState(false);

	const fetchAvailableFormations = async () => {
		setIsLoadingFormations(true);
		setError(null);

		try {
			const response = await fetch("/api/formations");

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des formations"
				);
			}

			const data = await response.json();

			// Filtrer les formations qui ne sont pas déjà associées à cette organisation
			const existingFormationIds = trainings.map((t) => t.courseId);
			const available = data.formations.filter(
				(f) => !existingFormationIds.includes(f.id)
			);

			setAvailableFormations(available);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoadingFormations(false);
		}
	};

	const handleOpenAddModal = () => {
		fetchAvailableFormations();
		setIsAddModalOpen(true);
	};

	const handleAssignFormation = async (formationId) => {
		setIsProcessing(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/trainings`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						courseId: formationId,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error ||
						"Erreur lors de l'association de la formation"
				);
			}

			// Fermer le modal et rafraîchir la liste
			setIsAddModalOpen(false);

			// Idéalement, on devrait rafraîchir la liste des formations ici
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleRemoveFormation = async () => {
		if (!selectedTraining) return;

		setIsProcessing(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/trainings/${selectedTraining.id}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error ||
						"Erreur lors de la suppression de l'association"
				);
			}

			// Fermer le modal et rafraîchir la liste
			setIsRemoveModalOpen(false);
			setSelectedTraining(null);

			// Idéalement, on devrait rafraîchir la liste des formations ici
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsProcessing(false);
		}
	};

	if (!trainings || trainings.length === 0) {
		return (
			<div className="text-center p-12 border rounded-md">
				<BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<h3 className="text-lg font-medium mb-2">Aucune formation</h3>
				<p className="text-muted-foreground mb-4">
					Cette organisation n'a pas encore de formations associées.
					Ajoutez des formations pour que les membres puissent y
					accéder.
				</p>
				<Button onClick={handleOpenAddModal}>
					<Plus className="mr-2 h-4 w-4" />
					Associer une formation
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">Formations associées</h3>
				<Button onClick={handleOpenAddModal}>
					<Plus className="mr-2 h-4 w-4" />
					Associer une formation
				</Button>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{trainings.map((training) => (
					<Card key={training.id} className="overflow-hidden">
						<CardHeader className="pb-2">
							<CardTitle className="text-lg">
								{training.course.name}
							</CardTitle>
							<CardDescription className="line-clamp-2">
								{training.course.description ||
									"Aucune description"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline">
									{training.course.category}
								</Badge>
								<Badge variant="outline">
									{training.course.difficulty}
								</Badge>
								<Badge variant="outline">
									{training.course.duration}
								</Badge>
							</div>
							{training.buildId && (
								<div className="mt-2">
									<Badge
										variant="outline"
										className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									>
										Build personnalisé
									</Badge>
								</div>
							)}
						</CardContent>
						<CardFooter className="border-t pt-4 flex justify-between">
							<Button variant="ghost" size="sm">
								<Eye className="h-4 w-4 mr-2" />
								Détails
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSelectedTraining(training);
									setIsRemoveModalOpen(true);
								}}
							>
								<Trash className="h-4 w-4 text-destructive" />
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>

			{/* Modal pour ajouter une formation */}
			<Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Associer une formation</DialogTitle>
						<DialogDescription>
							Sélectionnez une formation à associer à cette
							organisation
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						{isLoadingFormations ? (
							<div className="flex justify-center items-center p-8">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : availableFormations.length === 0 ? (
							<div className="text-center p-4 border rounded-md">
								<p className="text-muted-foreground">
									Aucune formation disponible à associer
								</p>
							</div>
						) : (
							<div className="border rounded-md divide-y max-h-96 overflow-y-auto">
								{availableFormations.map((formation) => (
									<div
										key={formation.id}
										className="p-4 flex items-center justify-between hover:bg-muted/50"
									>
										<div>
											<h4 className="font-medium">
												{formation.name}
											</h4>
											<div className="flex items-center gap-2 mt-1">
												<Badge variant="outline">
													{formation.category}
												</Badge>
												<Badge variant="outline">
													{formation.difficulty}
												</Badge>
											</div>
										</div>
										<Button
											size="sm"
											onClick={() =>
												handleAssignFormation(
													formation.id
												)
											}
											disabled={isProcessing}
										>
											<Plus className="h-4 w-4 mr-1" />
											Associer
										</Button>
									</div>
								))}
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsAddModalOpen(false)}
							disabled={isProcessing}
						>
							Fermer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Modal pour supprimer une association */}
			<Dialog
				open={isRemoveModalOpen}
				onOpenChange={setIsRemoveModalOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Supprimer l'association</DialogTitle>
						<DialogDescription>
							Êtes-vous sûr de vouloir supprimer cette formation
							de l'organisation ?
						</DialogDescription>
					</DialogHeader>

					{selectedTraining && (
						<div className="py-4">
							<p className="mb-2">
								<span className="font-semibold">
									Formation:
								</span>{" "}
								{selectedTraining.course.name}
							</p>
							{selectedTraining.buildId && (
								<Alert className="mt-2">
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										Cette formation possède un build
										personnalisé. La suppression de
										l'association n'entraînera pas la
										suppression du build.
									</AlertDescription>
								</Alert>
							)}
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsRemoveModalOpen(false)}
							disabled={isProcessing}
						>
							Annuler
						</Button>
						<Button
							variant="destructive"
							onClick={handleRemoveFormation}
							disabled={isProcessing}
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Suppression...
								</>
							) : (
								<>
									<Trash className="mr-2 h-4 w-4" />
									Supprimer
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
