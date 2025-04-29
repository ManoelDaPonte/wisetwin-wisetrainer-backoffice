//components/organizations/OrganizationUnassignedBuilds.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertTriangle, Loader2, Link2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function OrganizationUnassignedBuilds({ organizationId }) {
	const router = useRouter();
	const [builds, setBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredBuilds, setFilteredBuilds] = useState([]);
	const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
	const [selectedBuild, setSelectedBuild] = useState(null);
	const [availableFormations, setAvailableFormations] = useState([]);
	const [isLoadingFormations, setIsLoadingFormations] = useState(false);
	const [isAssociating, setIsAssociating] = useState(false);

	useEffect(() => {
		fetchUnassignedBuilds();
	}, [organizationId]);

	useEffect(() => {
		if (builds.length > 0 && searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			const filtered = builds.filter(
				(build) =>
					build.name.toLowerCase().includes(query) ||
					(build.description &&
						build.description.toLowerCase().includes(query)) ||
					build.version.toLowerCase().includes(query)
			);
			setFilteredBuilds(filtered);
		} else {
			setFilteredBuilds(builds);
		}
	}, [builds, searchQuery]);

	const fetchUnassignedBuilds = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/builds/unassigned`
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la récupération des builds");
			}

			const data = await response.json();
			setBuilds(data.builds || []);
			setFilteredBuilds(data.builds || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAssociate = (build) => {
		setSelectedBuild(build);
		fetchAvailableFormations();
		setIsAssociateDialogOpen(true);
	};

	const fetchAvailableFormations = async () => {
		setIsLoadingFormations(true);
		setError(null);

		try {
			// Récupérer toutes les formations qui n'ont pas encore de build associé
			const response = await fetch(`/api/formations?unassigned=true`);

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des formations"
				);
			}

			const data = await response.json();
			setAvailableFormations(data.formations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoadingFormations(false);
		}
	};

	const handleAssociateFormation = async (formationId) => {
		if (!selectedBuild) return;

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
					body: JSON.stringify({
						buildId: selectedBuild.id,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de l'association"
				);
			}

			// Fermer le modal et rafraîchir la liste
			setIsAssociateDialogOpen(false);
			fetchUnassignedBuilds();
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsAssociating(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-6">
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

	if (builds.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Builds sans formations associées</CardTitle>
					<CardDescription>
						Tous les builds de cette organisation sont associés à
						des formations
					</CardDescription>
				</CardHeader>
				<CardContent className="py-6 text-center">
					<Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
					<p className="text-muted-foreground">
						Aucun build disponible à associer
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Builds sans formations associées</CardTitle>
						<CardDescription>
							Ces builds peuvent être associés à des formations
						</CardDescription>
					</div>
					<div className="w-64">
						<Input
							type="search"
							placeholder="Rechercher..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="h-8"
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{filteredBuilds.map((build) => (
						<div
							key={build.id}
							className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
						>
							<div className="flex-grow min-w-0">
								<h4 className="font-medium truncate">
									{build.name}
								</h4>
								<div className="flex items-center gap-2 mt-1">
									<Badge variant="outline">
										v{build.version}
									</Badge>
									<Badge variant="outline">
										{build.totalSize}
									</Badge>
								</div>
							</div>
							<Button
								size="sm"
								onClick={() => handleAssociate(build)}
							>
								<Link2 className="mr-2 h-4 w-4" />
								Associer
							</Button>
						</div>
					))}
				</div>
			</CardContent>

			{/* Modal d'association */}
			<Dialog
				open={isAssociateDialogOpen}
				onOpenChange={setIsAssociateDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Associer à une formation</DialogTitle>
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
									Toutes les formations ont déjà un build
									associé.
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
												handleAssociateFormation(
													formation.id
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
							onClick={() => setIsAssociateDialogOpen(false)}
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
