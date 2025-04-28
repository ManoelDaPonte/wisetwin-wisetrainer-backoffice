// components/builds/FormationAssociations.jsx
"use client";

import { useState, useEffect } from "react";
import {
	Loader2,
	BookOpen,
	Link2,
	Unlink,
	Search,
	AlertCircle,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function FormationAssociations({ build }) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [formations, setFormations] = useState([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [availableFormations, setAvailableFormations] = useState([]);
	const [filteredFormations, setFilteredFormations] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isAssigning, setIsAssigning] = useState(false);

	useEffect(() => {
		if (build) {
			fetchAssociatedFormations();
		}
	}, [build]);

	useEffect(() => {
		if (isDialogOpen) {
			fetchAvailableFormations();
		}
	}, [isDialogOpen]);

	useEffect(() => {
		if (availableFormations.length > 0 && searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			const filtered = availableFormations.filter(
				(formation) =>
					formation.name.toLowerCase().includes(query) ||
					formation.formationId.toLowerCase().includes(query) ||
					formation.category.toLowerCase().includes(query)
			);
			setFilteredFormations(filtered);
		} else {
			setFilteredFormations(availableFormations);
		}
	}, [availableFormations, searchQuery]);

	const fetchAssociatedFormations = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/builds/formations/${build.internalId}`
			);
			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des formations associées"
				);
			}

			const data = await response.json();
			setFormations(data.formations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAvailableFormations = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/formations?unassigned=true");

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des formations disponibles"
				);
			}

			const data = await response.json();

			// Filtrer les formations qui ne sont pas déjà associées à ce build
			const formationIds = formations.map((f) => f.id);
			const available = data.formations.filter(
				(f) => !formationIds.includes(f.id)
			);

			setAvailableFormations(available);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAssociateFormation = async (formationId) => {
		setIsAssigning(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${formationId}/assign-build`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ buildId: build.internalId }),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de l'association"
				);
			}

			// Rafraîchir la liste des formations associées
			await fetchAssociatedFormations();
			setIsDialogOpen(false);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsAssigning(false);
		}
	};

	const handleRemoveAssociation = async (formationId) => {
		if (
			!confirm("Êtes-vous sûr de vouloir supprimer cette association ?")
		) {
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${formationId}/assign-build`,
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

			// Rafraîchir la liste des formations associées
			await fetchAssociatedFormations();
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

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
					<Button
						onClick={() => setIsDialogOpen(true)}
						disabled={isLoading}
					>
						<Link2 className="mr-2 h-4 w-4" />
						Associer une formation
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{isLoading ? (
					<div className="flex justify-center items-center p-8">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : formations.length === 0 ? (
					<div className="text-center p-8 border border-dashed rounded-md">
						<BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
						<p className="text-muted-foreground">
							Aucune formation n'est associée à ce build
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{formations.map((formation) => (
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
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										handleRemoveAssociation(formation.id)
									}
								>
									<Unlink className="h-4 w-4 text-muted-foreground" />
								</Button>
							</div>
						))}
					</div>
				)}
			</CardContent>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Associer une formation</DialogTitle>
						<DialogDescription>
							Sélectionnez une formation à associer à ce build
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Rechercher une formation..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<div className="border rounded-md max-h-80 overflow-y-auto">
							{isLoading ? (
								<div className="flex justify-center items-center p-8">
									<Loader2 className="h-6 w-6 animate-spin text-primary" />
								</div>
							) : filteredFormations.length === 0 ? (
								<div className="flex justify-center items-center p-8 text-muted-foreground">
									Aucune formation disponible
								</div>
							) : (
								<div className="divide-y">
									{filteredFormations.map((formation) => (
										<div
											key={formation.id}
											className="flex items-center justify-between p-3 hover:bg-muted/50"
										>
											<div className="flex-grow">
												<h4 className="font-medium">
													{formation.name}
												</h4>
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<Badge variant="outline">
														{formation.category}
													</Badge>
													<span>•</span>
													<span>
														{formation.formationId}
													</span>
												</div>
											</div>
											<Button
												size="sm"
												onClick={() =>
													handleAssociateFormation(
														formation.id
													)
												}
												disabled={isAssigning}
											>
												<Link2 className="mr-2 h-3 w-3" />
												Associer
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
						>
							Fermer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
