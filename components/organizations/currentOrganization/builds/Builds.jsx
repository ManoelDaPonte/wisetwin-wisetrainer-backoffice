//components/organizations/currentOrganization/builds/Builds.jsx
"use client";

import { useState } from "react";
import {
	Upload,
	Loader2,
	AlertTriangle,
	Package,
	Search,
	Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrganizationBuilds } from "@/lib/hooks/builds/useOrganizationBuilds";
import BuildUploadDialog from "./BuildUploadDialog";

export default function OrganizationBuilds({ organization }) {
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { builds, isLoading, error, uploadBuild } = useOrganizationBuilds(
		organization?.id
	);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Builds Unity</CardTitle>
					<CardDescription>Chargement des builds...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const filteredBuilds = builds.filter(
		(build) =>
			build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(build.version &&
				build.version.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Builds Unity</CardTitle>
							<CardDescription>
								Gérez les builds Unity pour cette organisation
							</CardDescription>
						</div>
						<Button onClick={() => setIsUploadDialogOpen(true)}>
							<Upload className="mr-2 h-4 w-4" />
							Uploader un build
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className="flex items-center gap-4 mb-4">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Rechercher un build..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					{builds.length === 0 && !isLoading ? (
						<div className="text-center py-8">
							<Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
							<p className="text-muted-foreground">
								Aucun build disponible pour cette organisation
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Utilisez le bouton "Uploader un build" pour
								ajouter des builds Unity
							</p>
						</div>
					) : filteredBuilds.length === 0 ? (
						<div className="text-center py-8">
							<Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
							<p className="text-muted-foreground">
								Aucun build ne correspond à votre recherche
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nom</TableHead>
									<TableHead>Version</TableHead>
									<TableHead>Date d'upload</TableHead>
									<TableHead>Taille</TableHead>
									<TableHead>Statut</TableHead>
									<TableHead>Formation associée</TableHead>
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
										<TableCell>
											{build.version || "-"}
										</TableCell>
										<TableCell>
											{build.uploadDate
												? new Date(
														build.uploadDate
												  ).toLocaleDateString("fr-FR")
												: build.createdAt
												? new Date(
														build.createdAt
												  ).toLocaleDateString("fr-FR")
												: "-"}
										</TableCell>
										<TableCell>
											{build.totalSize || "-"}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													build.status === "assigned"
														? "default"
														: "secondary"
												}
											>
												{build.status === "assigned"
													? "Assigné"
													: "Non assigné"}
											</Badge>
										</TableCell>
										<TableCell>
											{build.courses &&
											build.courses.length > 0 ? (
												<div className="flex flex-col gap-1">
													{build.courses.map(
														(course, index) => (
															<Badge
																key={index}
																variant="outline"
																className="flex items-center gap-1"
															>
																<Link className="h-3 w-3" />
																{course.name}
															</Badge>
														)
													)}
												</div>
											) : (
												<span className="text-muted-foreground">
													-
												</span>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="sm">
												Détails
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<BuildUploadDialog
				isOpen={isUploadDialogOpen}
				onClose={() => setIsUploadDialogOpen(false)}
				onUpload={uploadBuild}
			/>
		</div>
	);
}
