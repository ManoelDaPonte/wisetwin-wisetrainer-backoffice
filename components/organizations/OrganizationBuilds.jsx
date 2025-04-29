//components/organizations/OrganizationBuilds.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, AlertTriangle, Package, Search } from "lucide-react";
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

export default function OrganizationBuilds({
	organization,
	refreshTrigger = 0,
}) {
	const router = useRouter();
	const [builds, setBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredBuilds, setFilteredBuilds] = useState([]);

	// Container à utiliser - soit celui de l'organisation, soit un par défaut
	const containerName =
		organization.azureContainer || `org-${organization.id}`;

	useEffect(() => {
		fetchOrganizationBuilds();
	}, [organization.id, refreshTrigger]);

	useEffect(() => {
		if (builds.length > 0 && searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			const filtered = builds.filter(
				(build) =>
					build.name.toLowerCase().includes(query) ||
					build.version.toLowerCase().includes(query) ||
					(build.description &&
						build.description.toLowerCase().includes(query))
			);
			setFilteredBuilds(filtered);
		} else {
			setFilteredBuilds(builds);
		}
	}, [builds, searchQuery]);

	const fetchOrganizationBuilds = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/organizations/${organization.id}/builds`
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la récupération des builds");
			}

			const data = await response.json();

			// Ajouter le nombre de formations associées à chaque build
			const buildsWithCounts = await Promise.all(
				data.builds.map(async (build) => {
					try {
						const formationsResponse = await fetch(
							`/api/builds/${build.id}/formations`
						);
						if (formationsResponse.ok) {
							const formationsData =
								await formationsResponse.json();
							return {
								...build,
								formationsCount:
									formationsData.formations?.length || 0,
							};
						}
						return {
							...build,
							formationsCount: 0,
						};
					} catch (error) {
						console.error(
							`Erreur pour le build ${build.id}:`,
							error
						);
						return {
							...build,
							formationsCount: 0,
						};
					}
				})
			);

			setBuilds(buildsWithCounts || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
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

	if (builds.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Builds de l'organisation</CardTitle>
					<CardDescription>
						Cette organisation n'a pas encore de builds
					</CardDescription>
				</CardHeader>
				<CardContent className="py-8 text-center">
					<Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p className="text-muted-foreground mb-4">
						Aucun build trouvé. Commencez par uploader un build.
					</p>
					<Button onClick={() => router.reload()}>
						<Upload className="mr-2 h-4 w-4" />
						Uploader un build
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
						<CardTitle>
							Liste des builds ({builds.length})
						</CardTitle>
						<CardDescription>
							Tous les builds de cette organisation
						</CardDescription>
					</div>
					<div className="w-64">
						<Input
							type="search"
							placeholder="Rechercher..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
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
								<TableCell>{build.name}</TableCell>
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
										variant="outline"
										onClick={() =>
											(window.location.href = `/organizations/${
												organization.id
											}/builds/${encodeURIComponent(
												build.id
											)}`)
										}
									>
										Détails
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
