// components/organizations/OrganizationBuildAssociations.jsx
"use client";

import { useState, useEffect } from "react";
import { Link2, AlertTriangle, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function OrganizationBuildAssociations({
	organizationId,
	buildId,
}) {
	const [associations, setAssociations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
	const [availableFormations, setAvailableFormations] = useState([]);
	const [isLoadingFormations, setIsLoadingFormations] = useState(false);
	const [isAssociating, setIsAssociating] = useState(false);

	useEffect(() => {
		if (buildId) {
			fetchAssociations();
		}
	}, [organizationId, buildId]);

	const fetchAssociations = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/builds/formations/${buildId}`);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des associations"
				);
			}

			const data = await response.json();
			setAssociations(data.formations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAvailableFormations = async () => {
		setIsLoadingFormations(true);
		setError(null);

		try {
			// Récupérer les formations qui appartiennent à cette organisation
			const response = await fetch(
				`/api/organizations/${organizationId}/trainings`
			);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des formations"
				);
			}

			const data = await response.json();

			// Filtrer pour exclure les formations déjà associées à ce build
			const existingFormationIds = associations.map((a) => a.id);
			const availableOrgFormations = data.trainings.filter(
				(t) => !existingFormationIds.includes(t.course.id) && !t.buildId
			);

			setAvailableFormations(availableOrgFormations);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoadingFormations(false);
		}
	};

	const handleAssociateFormation = async (formationId) => {
		setIsAssociating(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${formationId}/assign-build`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ buildId }),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de l'association"
				);
			}

			// Fermer le modal et rafraîchir la liste
			setIsAssociateModalOpen(false);
			fetchAssociations();
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsAssociating(false);
		}
	};

	const handleOpenAssociateModal = () => {
		fetchAvailableFormations();
		setIsAssociateModalOpen(true);
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Formations associées</CardTitle>
						<CardDescription>
							Formations utilisant ce build Unity
						</CardDescription>
					</div>
					<Button onClick={handleOpenAssociateModal}>
						<Link2 className="mr-2 h-4 w-4" />
						Associer une formation
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{associations.length === 0 ? (
					<div className="text-center p-8 border border-dashed rounded-md">
						<BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
						<p className="text-muted-foreground">
							Aucune formation n'est associée à ce build
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{associations.map((formation) => (
							<div
								key={formation.id}
								className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30"
							>
								<div className="flex-grow">
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
										<Badge variant="outline">
											{formation.duration}
										</Badge>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>

			{/* Modal d'association */}
			<Dialog
				open={isAssociateModalOpen}
				onOpenChange={setIsAssociateModalOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Associer une formation</DialogTitle>
						<DialogDescription>
							Sélectionnez une formation à associer à ce build
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
									Aucune formation disponible à associer.
									Assurez-vous que l'organisation a des
									formations qui ne sont pas déjà associées à
									un build.
								</p>
							</div>
						) : (
							<div className="border rounded-md divide-y max-h-96 overflow-y-auto">
								{availableFormations.map((training) => (
									<div
										key={training.id}
										className="p-4 flex items-center justify-between hover:bg-muted/50"
									>
										<div>
											<h4 className="font-medium">
												{training.course.name}
											</h4>
											<div className="flex items-center gap-2 mt-1">
												<Badge variant="outline">
													{training.course.category}
												</Badge>
												<Badge variant="outline">
													{training.course.difficulty}
												</Badge>
											</div>
										</div>
										<Button
											size="sm"
											onClick={() =>
												handleAssociateFormation(
													training.course.id
												)
											}
											disabled={isAssociating}
										>
											<Link2 className="h-4 w-4 mr-1" />
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
							onClick={() => setIsAssociateModalOpen(false)}
							disabled={isAssociating}
						>
							Fermer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
