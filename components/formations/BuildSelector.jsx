// components/formations/BuildSelector.jsx
"use client";

import { useState, useEffect } from "react";
import {
	Loader2,
	Package,
	Link as LinkIcon,
	XCircle,
	CheckCircle,
	Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent } from "@/components/ui/card";
import { useBuildsSelection } from "@/hooks/useBuildsSelection";

export default function BuildSelector({
	formationId,
	currentBuildId,
	onAssign,
}) {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState(null);

	const {
		builds,
		groupedBuilds,
		isLoading,
		searchQuery,
		setSearchQuery,
		selectedBuildId,
		setSelectedBuildId,
		isProcessing: isAssigning,
		setIsProcessing: setIsAssigning,
		fetchBuilds,
		currentBuild,
	} = useBuildsSelection(currentBuildId);

	useEffect(() => {
		if (open) {
			fetchBuilds();
		}
	}, [open, fetchBuilds]);

	const handleAssignBuild = async () => {
		if (!selectedBuildId) return;

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
					body: JSON.stringify({ buildId: selectedBuildId }),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de l'association du build"
				);
			}

			// Notifier le composant parent
			if (onAssign) {
				onAssign(selectedBuildId);
			}

			setOpen(false);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsAssigning(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<Label className="text-base font-medium">
					Build Unity associé
				</Label>
				<Button
					onClick={() => setOpen(true)}
					variant="outline"
					size="sm"
				>
					<LinkIcon className="mr-2 h-4 w-4" />
					{currentBuildId ? "Changer de build" : "Associer un build"}
				</Button>
			</div>

			{currentBuildId ? (
				<Card>
					<CardContent className="py-4">
						<div className="flex items-center gap-3">
							<Package className="h-8 w-8 text-primary" />
							<div className="flex-grow">
								<h4 className="font-medium">
									{currentBuild?.name || "Build inconnu"}
								</h4>
								<p className="text-sm text-muted-foreground">
									{currentBuild ? (
										<>
											ID:{" "}
											{currentBuild.internalId.substring(
												0,
												20
											)}
											...
										</>
									) : (
										<>
											ID:{" "}
											{currentBuildId.substring(0, 20)}...
										</>
									)}
								</p>
							</div>
							<Badge
								variant="outline"
								className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
							>
								<CheckCircle className="mr-1 h-3 w-3" />
								Associé
							</Badge>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="flex items-center justify-center p-8 border rounded-md border-dashed">
					<div className="text-center">
						<Package className="mx-auto h-8 w-8 text-muted-foreground" />
						<p className="mt-2 text-sm text-muted-foreground">
							Aucun build n'est associé à cette formation
						</p>
					</div>
				</div>
			)}

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Associer un build Unity</DialogTitle>
						<DialogDescription>
							Sélectionnez un build Unity à associer à cette
							formation
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{error && (
							<Alert variant="destructive">
								<XCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Rechercher un build..."
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
							) : groupedBuilds.length === 0 ? (
								<div className="flex justify-center items-center p-8 text-muted-foreground">
									Aucun build disponible
								</div>
							) : (
								<div className="divide-y">
									{groupedBuilds.map((build, index) => (
										<div
											key={`${build.internalId}-${index}`}
											className={`flex items-center p-3 hover:bg-muted/50 cursor-pointer ${
												selectedBuildId ===
												build.internalId
													? "bg-primary/10"
													: ""
											}`}
											onClick={() =>
												setSelectedBuildId(
													build.internalId
												)
											}
										>
											<div className="mr-3 flex-shrink-0">
												{selectedBuildId ===
												build.internalId ? (
													<CheckCircle className="h-5 w-5 text-primary" />
												) : (
													<Package className="h-5 w-5 text-muted-foreground" />
												)}
											</div>
											<div className="flex-grow min-w-0">
												<h4 className="font-medium truncate">
													{build.name}
												</h4>
												<div className="flex flex-wrap gap-1 mt-1">
													{build.containers.map(
														(container, idx) => (
															<Badge
																key={`${container}-${idx}`}
																variant="outline"
																className="text-xs"
															>
																{container}
															</Badge>
														)
													)}
												</div>
												<div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
													<span>
														Version: {build.version}
													</span>
													<span>•</span>
													<span>
														{build.uploadDate}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Annuler
						</Button>
						<Button
							onClick={handleAssignBuild}
							disabled={!selectedBuildId || isAssigning}
						>
							{isAssigning ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Association...
								</>
							) : (
								<>
									<LinkIcon className="mr-2 h-4 w-4" />
									Associer le build
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
