import { useState } from "react";
import {
	MoreHorizontal,
	Calendar,
	Package,
	Cloud,
	Tag,
	Eye,
	Download,
	Trash,
	FileCode,
	CheckCircle,
	XCircle,
	AlertCircle,
	Loader2,
	Files,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBuilds } from "@/hooks/useBuilds";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BuildAssociationsModal from "./BuildAssociationsModal";

// Mapping des statuts avec leurs configurations visuelles
const statusConfig = {
	published: {
		label: "Publié",
		color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
		icon: <CheckCircle className="h-4 w-4" />,
	},
	uploading: {
		label: "En cours d'upload",
		color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
		icon: <Cloud className="h-4 w-4" />,
	},
	error: {
		label: "Erreur",
		color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
		icon: <XCircle className="h-4 w-4" />,
	},
};

export default function BuildsList({ container = null }) {
	const { builds, loading, error, refreshBuilds } = useBuilds(container);
	const [expandedBuilds, setExpandedBuilds] = useState({});
	const [selectedBuild, setSelectedBuild] = useState(null);
	const [associationsModalOpen, setAssociationsModalOpen] = useState(false);

	// Fonction pour basculer l'état d'expansion d'un build
	const toggleBuildExpansion = (buildId) => {
		setExpandedBuilds((prev) => ({
			...prev,
			[buildId]: !prev[buildId],
		}));
	};

	// Fonction pour ouvrir le modal d'associations
	const openAssociationsModal = (build) => {
		setSelectedBuild(build);
		setAssociationsModalOpen(true);
	};

	// Fonction pour gérer la suppression d'un build
	const handleDeleteBuild = async (build) => {
		if (
			window.confirm(
				`Êtes-vous sûr de vouloir supprimer le build "${build.name}" ?`
			)
		) {
			try {
				const response = await fetch("/api/builds/delete", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						container: build.containerName,
						blob: build.internalId,
					}),
				});

				if (!response.ok) {
					throw new Error("Erreur lors de la suppression du build");
				}

				// Rafraîchir la liste des builds
				refreshBuilds();
				alert("Build supprimé avec succès");
			} catch (err) {
				console.error("Erreur:", err);
				alert("Erreur lors de la suppression du build: " + err.message);
			}
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-lg">Chargement des builds...</span>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="my-4">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Erreur lors du chargement des builds: {error}
				</AlertDescription>
			</Alert>
		);
	}

	if (builds.length === 0) {
		return (
			<div className="border rounded-md p-8 text-center">
				<FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<h3 className="text-lg font-medium mb-2">Aucun build trouvé</h3>
				<p className="text-muted-foreground mb-4">
					{container
						? `Aucun build n'est disponible dans le container "${container}".`
						: "Vous n'avez pas encore uploadé de builds Unity."}
				</p>
				<Button>
					<Cloud className="mr-2 h-4 w-4" />
					Uploader un build
				</Button>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				{builds.map((build) => (
					<Card
						key={build.id}
						className="hover-lift transition-all overflow-hidden"
					>
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between">
								<div className="space-y-1">
									<div className="flex items-center">
										<FileCode className="mr-2 h-5 w-5 text-wisetwin-blue" />
										<CardTitle className="text-lg">
											{build.name}
										</CardTitle>
									</div>
									<CardDescription className="line-clamp-2">
										{build.description ||
											"Aucune description fournie"}
									</CardDescription>
									{build.fullPath && (
										<p className="text-xs text-muted-foreground">
											Chemin: {build.fullPath}
										</p>
									)}
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>
											Actions
										</DropdownMenuLabel>
										{build.status === "published" && (
											<>
												<DropdownMenuItem>
													<Eye className="mr-2 h-4 w-4" />
													<span>Prévisualiser</span>
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														window.open(
															build.url,
															"_blank"
														)
													}
												>
													<Download className="mr-2 h-4 w-4" />
													<span>Télécharger</span>
												</DropdownMenuItem>
											</>
										)}
										<DropdownMenuItem
											onClick={() =>
												openAssociationsModal(build)
											}
										>
											<Tag className="mr-2 h-4 w-4" />
											<span>
												Associer à des organisations
											</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-destructive"
											onClick={() =>
												handleDeleteBuild(build)
											}
										>
											<Trash className="mr-2 h-4 w-4" />
											<span>Supprimer</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="mt-1 flex items-center space-x-2 flex-wrap gap-y-2">
								<Badge
									variant="outline"
									className={
										statusConfig[
											build.status || "published"
										].color
									}
								>
									<span className="mr-1">
										{
											statusConfig[
												build.status || "published"
											].icon
										}
									</span>
									{
										statusConfig[
											build.status || "published"
										].label
									}
								</Badge>
								<Badge variant="outline">
									v{build.version}
								</Badge>
								{build.containerName && (
									<Badge
										variant="outline"
										className="bg-wisetwin-blue/10 text-wisetwin-blue"
									>
										{build.containerName}
									</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{build.status === "uploading" && (
								<div className="mb-3 space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span>Upload en cours...</span>
										<span>{build.uploadProgress}%</span>
									</div>
									<Progress
										value={build.uploadProgress}
										className="h-2"
									/>
								</div>
							)}
							<div className="flex items-center justify-between py-1">
								<div className="flex items-center">
									<Package className="mr-2 h-4 w-4 text-muted-foreground" />
									<span>{build.totalSize || build.size}</span>
								</div>
								<div className="flex items-center">
									<Tag className="mr-2 h-4 w-4 text-muted-foreground" />
									<span>
										{build.associatedOrganizations > 0
											? `${
													build.associatedOrganizations
											  } organisation${
													build.associatedOrganizations >
													1
														? "s"
														: ""
											  }`
											: "Aucune organisation"}
									</span>
								</div>
							</div>

							{/* Afficher les organisations associées si présentes */}
							{build.organizations &&
								build.organizations.length > 0 && (
									<div className="mt-2">
										<h4 className="text-sm font-medium mb-1">
											Organisations:
										</h4>
										<div className="flex flex-wrap gap-1">
											{build.organizations.map(
												(org, index) => (
													<Badge
														key={index}
														variant="outline"
														className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
													>
														{org.name}
													</Badge>
												)
											)}
										</div>
									</div>
								)}

							{/* Affichage des fichiers du build */}
							{build.files && build.files.length > 0 && (
								<div className="mt-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											toggleBuildExpansion(build.id)
										}
										className="flex items-center text-sm text-muted-foreground p-0 h-auto"
									>
										<Files className="mr-1 h-3 w-3" />
										<span className="mr-1">
											{build.files.length} fichiers
										</span>
										{expandedBuilds[build.id] ? (
											<ChevronUp className="h-3 w-3" />
										) : (
											<ChevronDown className="h-3 w-3" />
										)}
									</Button>

									{expandedBuilds[build.id] && (
										<div className="mt-2 text-sm border rounded-md divide-y">
											{build.files.map((file, index) => (
												<div
													key={index}
													className="p-2 flex justify-between items-center"
												>
													<span className="truncate max-w-[60%]">
														{file.name
															.split("/")
															.pop()}
													</span>
													<div className="flex items-center gap-3">
														<span className="text-xs text-muted-foreground">
															{file.size}
														</span>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6"
															onClick={() =>
																window.open(
																	file.url,
																	"_blank"
																)
															}
														>
															<Download className="h-3 w-3" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</CardContent>
						<CardFooter className="border-t bg-muted/30 py-2 text-sm text-muted-foreground">
							<div className="flex items-center">
								<Calendar className="mr-2 h-3 w-3" />
								<span>Uploadé le {build.uploadDate}</span>
							</div>
						</CardFooter>
					</Card>
				))}
			</div>

			{/* Modal pour associer le build aux organisations */}
			{selectedBuild && (
				<BuildAssociationsModal
					build={selectedBuild}
					isOpen={associationsModalOpen}
					onClose={() => setAssociationsModalOpen(false)}
					onSuccess={() => {
						setAssociationsModalOpen(false);
						refreshBuilds();
					}}
				/>
			)}
		</>
	);
}
