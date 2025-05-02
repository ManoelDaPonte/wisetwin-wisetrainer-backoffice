//components/formations/view/Formation3DModules.jsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Box,
	PlusCircle,
	ChevronRight,
	Calendar,
	Info,
	Link,
	ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Formation3DModules({ formation, isPreview = false }) {
	const router = useRouter();
	const builds3D = formation?.builds3D || [];

	const handleAddModule = () => {
		// Rediriger vers la page d'ajout ou ouvrir un modal
		router.push(`/formations/edit/${formation.id}/add-3d`);
	};

	const handleViewDetails = (buildId) => {
		router.push(`/formations/edit/${formation.id}/3d/${buildId}`);
	};

	// Pour l'aperçu, afficher uniquement les 2 premiers modules
	const displayedBuilds = isPreview ? builds3D.slice(0, 2) : builds3D;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex justify-between items-center">
					<div className="flex items-center">
						<Box className="mr-2 h-5 w-5 text-wisetwin-blue" />
						<CardTitle>Modules 3D</CardTitle>
					</div>
					<Button onClick={handleAddModule} size="sm">
						<PlusCircle className="mr-2 h-4 w-4" />
						Ajouter un module 3D
					</Button>
				</div>
				<CardDescription>
					Environnements 3D interactifs pour la formation pratique
				</CardDescription>
			</CardHeader>
			<CardContent>
				{displayedBuilds.length === 0 ? (
					<div className="text-center py-8 border rounded-md">
						<Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground mb-2">
							Aucun module 3D disponible
						</p>
						<p className="text-sm text-muted-foreground">
							Cliquez sur "Ajouter un module 3D" pour commencer
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{displayedBuilds.map((build) => (
							<div
								key={build.id}
								className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-md hover:bg-muted/20 transition-colors"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<h3 className="font-medium">
											{build.name}
										</h3>
										<Badge variant="outline">
											v{build.version}
										</Badge>
										<Badge
											variant="outline"
											className={
												build.status === "available"
													? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
													: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
											}
										>
											{build.status === "available"
												? "Disponible"
												: build.status}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground mt-1">
										{build.description ||
											"Aucune description"}
									</p>
									<div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
										<div className="flex items-center">
											<Calendar className="mr-1 h-3 w-3" />
											<span>
												Mis à jour:{" "}
												{new Date(
													build.updatedAt
												).toLocaleDateString("fr-FR")}
											</span>
										</div>
										{build.azureUrl && (
											<div className="flex items-center">
												<Link className="mr-1 h-3 w-3" />
												<span>
													URL Azure disponible
												</span>
											</div>
										)}
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleViewDetails(build.id)}
								>
									<Info className="mr-2 h-4 w-4" />
									Détails
								</Button>
								{build.azureUrl && (
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											window.open(
												build.azureUrl,
												"_blank"
											)
										}
									>
										<ExternalLink className="mr-2 h-4 w-4" />
										Tester
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
			{isPreview && builds3D.length > 2 && (
				<CardFooter className="border-t">
					<Button
						variant="ghost"
						size="sm"
						className="ml-auto"
						onClick={() =>
							router.push(`/formations/view/${formation.id}`)
						}
					>
						Voir tous les modules 3D ({builds3D.length})
						<ChevronRight className="ml-1 h-4 w-4" />
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
