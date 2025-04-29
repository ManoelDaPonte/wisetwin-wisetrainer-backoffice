//components/organizations/OrganizationBuildsList.jsx
"use client";

import { useState, useEffect } from "react";
import {
	Package,
	AlertTriangle,
	Loader2,
	Link2,
	Search,
	Calendar,
	CheckCircle,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function OrganizationBuildsList({ organizationId }) {
	const [builds, setBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredBuilds, setFilteredBuilds] = useState([]);
	const [selectedBuild, setSelectedBuild] = useState(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [associatedFormations, setAssociatedFormations] = useState([]);
	const [isLoadingAssociations, setIsLoadingAssociations] = useState(false);

	useEffect(() => {
		fetchBuilds();
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

	const fetchBuilds = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/builds`
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la récupération des builds");
			}

			const data = await response.json();
			setBuilds(data.builds || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleViewDetails = async (build) => {
		setSelectedBuild(build);
		setIsDetailsModalOpen(true);
		fetchBuildAssociations(build.id);
	};

	const fetchBuildAssociations = async (buildId) => {
		setIsLoadingAssociations(true);

		try {
			const response = await fetch(`/api/builds/${buildId}/formations`);

			if (response.ok) {
				const data = await response.json();
				setAssociatedFormations(data.formations || []);
			} else {
				setAssociatedFormations([]);
			}
		} catch (err) {
			console.error("Erreur:", err);
			setAssociatedFormations([]);
		} finally {
			setIsLoadingAssociations(false);
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
					<CardTitle>Builds de l'organisation</CardTitle>
					<CardDescription>
						Aucun build disponible dans cette organisation
					</CardDescription>
				</CardHeader>
				<CardContent className="py-6 text-center">
					<Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
					<p className="text-muted-foreground mb-4">
						Cette organisation n'a pas encore de builds Unity
					</p>
					<Button
						variant="outline"
						onClick={() =>
							(window.location.href = `/organizations/${organizationId}/builds`)
						}
					>
						Gérer les builds
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Builds de l'organisation</CardTitle>
						<CardDescription>
							Liste des builds disponibles ({builds.length})
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
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nom</TableHead>
							<TableHead>Version</TableHead>
							<TableHead>Date d'upload</TableHead>
							<TableHead>Taille</TableHead>
							<TableHead>Formations</TableHead>
							<TableHead className="text-right">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredBuilds.map((build) => (
							<TableRow key={build.id}>
								<TableCell className="font-medium">
									{build.name}
								</TableCell>
								<TableCell>v{build.version}</TableCell>
								<TableCell>{build.uploadDate}</TableCell>
								<TableCell>{build.totalSize}</TableCell>
								<TableCell>
									{build.formationsCount > 0 ? (
										<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
											{build.formationsCount} associée(s)
										</Badge>
									) : (
										<Badge variant="outline">
											Non associé
										</Badge>
									)}
								</TableCell>
								<TableCell className="text-right">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => handleViewDetails(build)}
									>
										Détails
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>

			{/* Modal des détails du build */}
			<Dialog
				open={isDetailsModalOpen}
				onOpenChange={setIsDetailsModalOpen}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Détails du build</DialogTitle>
						<DialogDescription>
							Informations détaillées et formations associées
						</DialogDescription>
					</DialogHeader>

					{selectedBuild && (
						<div className="py-4 space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Nom
									</p>
									<p className="font-medium">
										{selectedBuild.name}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Version
									</p>
									<p>{selectedBuild.version}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Date d'upload
									</p>
									<p>{selectedBuild.uploadDate}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Taille
									</p>
									<p>{selectedBuild.totalSize}</p>
								</div>
								<div className="col-span-2">
									<p className="text-sm font-medium text-muted-foreground">
										ID
									</p>
									<p className="text-sm break-all font-mono">
										{selectedBuild.id}
									</p>
								</div>
							</div>

							<div className="border-t pt-4">
								<h4 className="font-medium mb-2">
									Formations associées
								</h4>

								{isLoadingAssociations ? (
									<div className="flex justify-center py-4">
										<Loader2 className="h-6 w-6 animate-spin text-primary" />
									</div>
								) : associatedFormations.length > 0 ? (
									<div className="space-y-2">
										{associatedFormations.map(
											(formation) => (
												<div
													key={formation.id}
													className="p-2 border rounded-md flex items-center justify-between"
												>
													<div>
														<p className="font-medium">
															{formation.name}
														</p>
														<div className="flex gap-2 mt-1">
															<Badge variant="outline">
																{
																	formation.category
																}
															</Badge>
															<Badge variant="outline">
																{
																	formation.difficulty
																}
															</Badge>
														</div>
													</div>
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															(window.location.href = `/formations/view/${formation.id}`)
														}
													>
														Voir
													</Button>
												</div>
											)
										)}
									</div>
								) : (
									<div className="text-center py-4 border rounded-md">
										<p className="text-muted-foreground">
											Ce build n'est associé à aucune
											formation
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDetailsModalOpen(false)}
						>
							Fermer
						</Button>
						<Button
							onClick={() =>
								(window.location.href = `/organizations/${organizationId}/builds`)
							}
						>
							Gérer les builds
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
