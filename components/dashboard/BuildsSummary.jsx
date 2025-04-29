// components/dashboard/BuildsSummary.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Cloud, CheckCircle, XCircle, FileCode } from "lucide-react";
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

// Mappings des statuts avec leurs configurations visuelles
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

export default function BuildsSummary({ data }) {
	const router = useRouter();

	// État par défaut des builds si aucune donnée n'est fournie
	const defaultBuilds = [
		{
			id: "1",
			name: "Environnement Industriel v2.1",
			containerName: "builds",
			version: "2.1",
			status: "published",
			uploadDate: "Il y a 2 jours",
			size: "45.2 MB",
			associations: 3,
		},
		{
			id: "2",
			name: "Sécurité en Milieu Hospitalier",
			containerName: "builds-medical",
			version: "1.0",
			status: "published",
			uploadDate: "Il y a 4 jours",
			size: "32.8 MB",
			associations: 1,
		},
		{
			id: "3",
			name: "Gestion de Crise",
			containerName: "builds",
			version: "3.5",
			status: "published",
			uploadDate: "Il y a 1 semaine",
			size: "56.4 MB",
			associations: 2,
		},
	];

	// Utiliser les données fournies ou les données par défaut
	const builds = data?.length > 0 ? data.slice(0, 3) : defaultBuilds;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileCode className="h-5 w-5 text-muted-foreground" />
					Builds récents
				</CardTitle>
				<CardDescription>
					Les derniers builds Unity uploadés sur la plateforme
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{builds.map((build) => (
						<div
							key={build.id}
							className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/20 cursor-pointer"
							onClick={() =>
								(window.location.href = `/builds/view/${build.containerName}/${build.id}`)
							}
						>
							<div className="flex items-center gap-3">
								<Package className="h-8 w-8 text-primary p-1 bg-primary/10 rounded-md" />
								<div>
									<h3 className="font-medium">
										{build.name}
									</h3>
									<div className="flex items-center gap-2 mt-1">
										<Badge variant="outline">
											v{build.version}
										</Badge>
										<Badge variant="outline">
											{build.containerName}
										</Badge>
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
														build.status ||
															"published"
													].icon
												}
											</span>
											{
												statusConfig[
													build.status || "published"
												].label
											}
										</Badge>
									</div>
								</div>
							</div>
							<div className="text-right text-sm text-muted-foreground">
								<div>{build.uploadDate}</div>
								<div>{build.size}</div>
								<div>{build.associations} associations</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
			<CardFooter>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => (window.location.href = "/builds")}
				>
					Voir tous les builds
				</Button>
			</CardFooter>
		</Card>
	);
}
