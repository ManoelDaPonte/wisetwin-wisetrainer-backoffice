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

// Exemple de données (à remplacer par des données réelles)
const builds = [
	{
		id: "1",
		name: "Sécurité industrielle v1.2",
		version: "1.2",
		description: "Build officiel pour la formation sécurité industrielle",
		size: "45.8 MB",
		uploadDate: "15/04/2025",
		status: "published",
		uploadProgress: 100,
		associatedOrganizations: 3,
	},
	{
		id: "2",
		name: "Gestion de crise v2.0",
		version: "2.0",
		description: "Nouveau build avec amélioration des interactions",
		size: "62.3 MB",
		uploadDate: "20/04/2025",
		status: "published",
		uploadProgress: 100,
		associatedOrganizations: 5,
	},
	{
		id: "3",
		name: "Prévention des risques v1.5",
		version: "1.5",
		description: "Mise à jour du système de questions",
		size: "38.7 MB",
		uploadDate: "22/04/2025",
		status: "uploading",
		uploadProgress: 65,
		associatedOrganizations: 0,
	},
	{
		id: "4",
		name: "Équipements de protection v1.0",
		version: "1.0",
		description: "Première version du module de formation",
		size: "52.1 MB",
		uploadDate: "10/04/2025",
		status: "error",
		uploadProgress: 100,
		associatedOrganizations: 0,
	},
	{
		id: "5",
		name: "Communication d'équipe v2.1",
		version: "2.1",
		description: "Optimisation des performances et corrections de bugs",
		size: "41.9 MB",
		uploadDate: "18/04/2025",
		status: "published",
		uploadProgress: 100,
		associatedOrganizations: 8,
	},
];

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

export default function BuildsList() {
	return (
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
									{build.description}
								</CardDescription>
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
											<DropdownMenuItem>
												<Download className="mr-2 h-4 w-4" />
												<span>Télécharger</span>
											</DropdownMenuItem>
										</>
									)}
									<DropdownMenuItem>
										<Tag className="mr-2 h-4 w-4" />
										<span>
											Associer à des organisations
										</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="text-destructive">
										<Trash className="mr-2 h-4 w-4" />
										<span>Supprimer</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="mt-1 flex items-center space-x-2">
							<Badge
								variant="outline"
								className={statusConfig[build.status].color}
							>
								<span className="mr-1">
									{statusConfig[build.status].icon}
								</span>
								{statusConfig[build.status].label}
							</Badge>
							<Badge variant="outline">v{build.version}</Badge>
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
								<span>{build.size}</span>
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
	);
}
