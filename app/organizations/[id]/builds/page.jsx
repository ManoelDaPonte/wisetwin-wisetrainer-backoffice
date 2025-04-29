//app/organizations/[id]/builds/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Loader2,
	AlertTriangle,
	Upload,
	Package,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useOrganizations } from "@/hooks/useOrganizations";
import OrganizationBuildUploader from "@/components/organizations/OrganizationBuildUploader";
import OrganizationBuilds from "@/components/organizations/OrganizationBuilds";
import OrganizationUnassignedBuilds from "@/components/organizations/OrganizationUnassignedBuilds";

export default function OrganizationBuildsPage() {
	const params = useParams();
	const router = useRouter();
	const { organization, isLoading, error } = useOrganizations(params.id);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [buildCount, setBuildCount] = useState(0);
	const [shouldRefresh, setShouldRefresh] = useState(0);

	useEffect(() => {
		if (organization) {
			fetchBuildCount();
		}
	}, [organization, shouldRefresh]);

	const fetchBuildCount = async () => {
		try {
			const response = await fetch(
				`/api/organizations/${params.id}/builds/count`
			);
			if (response.ok) {
				const data = await response.json();
				setBuildCount(data.count);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération du nombre de builds:",
				error
			);
		}
	};

	const handleBack = () => {
		router.push(`/organizations/${params.id}`);
	};

	const handleUploadSuccess = () => {
		setIsUploadModalOpen(false);
		setShouldRefresh((prev) => prev + 1);
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour à l'organisation
					</Button>
					<Button onClick={() => setIsUploadModalOpen(true)}>
						<Upload className="mr-2 h-4 w-4" />
						Uploader un build
					</Button>
				</div>

				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : error ? (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : organization ? (
					<div className="space-y-6">
						<div>
							<h1 className="text-2xl font-bold flex items-center">
								<Package className="mr-2 h-6 w-6" />
								Builds de {organization.name}
							</h1>
							<p className="text-muted-foreground mt-1">
								{buildCount} build{buildCount !== 1 ? "s" : ""}{" "}
								disponible{buildCount !== 1 ? "s" : ""}
							</p>
						</div>

						<OrganizationUnassignedBuilds
							organizationId={organization.id}
							refreshTrigger={shouldRefresh}
						/>

						<OrganizationBuilds
							organization={organization}
							refreshTrigger={shouldRefresh}
						/>
					</div>
				) : (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Organisation non trouvée
						</AlertDescription>
					</Alert>
				)}

				{/* Modal d'upload de build */}
				<Dialog
					open={isUploadModalOpen}
					onOpenChange={setIsUploadModalOpen}
				>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Uploader un build Unity</DialogTitle>
						</DialogHeader>
						{organization && (
							<OrganizationBuildUploader
								organizationId={organization.id}
								containerName={
									organization.azureContainer ||
									`org-${organization.id}`
								}
								onClose={() => setIsUploadModalOpen(false)}
								onSuccess={handleUploadSuccess}
							/>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</AdminLayout>
	);
}
