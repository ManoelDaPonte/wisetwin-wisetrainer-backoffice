// components/organizations/OrganizationBuilds.jsx
"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import BuildsList from "@/components/builds/BuildsList";
import OrganizationBuildUploader from "./OrganizationBuildUploader";

export default function OrganizationBuilds({ organization }) {
	const [builds, setBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredBuilds, setFilteredBuilds] = useState([]);

	// Container à utiliser - soit celui de l'organisation, soit un par défaut
	const containerName =
		organization.azureContainer || `org-${organization.id}`;

	useEffect(() => {
		fetchOrganizationBuilds();
	}, [organization.id]);

	useEffect(() => {
		if (builds.length > 0 && searchQuery.trim() !== "") {
			const query = searchQuery.toLowerCase();
			const filtered = builds.filter(
				(build) =>
					build.name.toLowerCase().includes(query) ||
					build.description.toLowerCase().includes(query) ||
					build.version.toLowerCase().includes(query)
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
			setBuilds(data.builds || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleUploadSuccess = (newBuild) => {
		setBuilds((prev) => [newBuild, ...prev]);
		setIsUploadModalOpen(false);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">
						Builds de l'organisation
					</h2>
					<p className="text-muted-foreground">
						Gérez les builds Unity spécifiques à cette organisation
					</p>
				</div>
				<Button onClick={() => setIsUploadModalOpen(true)}>
					<Upload className="mr-2 h-4 w-4" />
					Uploader un build
				</Button>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Container Azure</CardTitle>
					<CardDescription>
						Tous les builds sont stockés dans ce container
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Package className="h-10 w-10 p-2 bg-primary/10 rounded-lg text-primary" />
						<div>
							<h3 className="font-medium">{containerName}</h3>
							<p className="text-sm text-muted-foreground">
								{organization.azureContainer
									? "Container personnalisé de l'organisation"
									: "Container par défaut généré"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="relative flex-1 min-w-[200px] mb-4">
				<Input
					type="search"
					placeholder="Rechercher des builds..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : filteredBuilds.length > 0 ? (
				<BuildsList
					builds={filteredBuilds}
					onRefresh={fetchOrganizationBuilds}
				/>
			) : (
				<div className="text-center p-12 border rounded-md">
					<Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucun build trouvé
					</h3>
					<p className="text-muted-foreground mb-4">
						Cette organisation n'a pas encore de builds Unity.
						Uploadez un build pour commencer.
					</p>
					<Button onClick={() => setIsUploadModalOpen(true)}>
						<Upload className="mr-2 h-4 w-4" />
						Uploader un build
					</Button>
				</div>
			)}

			{/* Modal d'upload de build */}
			<Dialog
				open={isUploadModalOpen}
				onOpenChange={setIsUploadModalOpen}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Uploader un build Unity</DialogTitle>
						<DialogDescription>
							Ajoutez un nouveau build Unity pour cette
							organisation
						</DialogDescription>
					</DialogHeader>
					<OrganizationBuildUploader
						organizationId={organization.id}
						containerName={containerName}
						onClose={() => setIsUploadModalOpen(false)}
						onSuccess={handleUploadSuccess}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
