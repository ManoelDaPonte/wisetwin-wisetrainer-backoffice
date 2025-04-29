// app/organizations/[id]/trainings/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrganizations } from "@/hooks/useOrganizations";
import OrganizationTrainingsList from "@/components/organizations/OrganizationTrainingsList";

export default function OrganizationTrainingsPage() {
	const params = useParams();
	const router = useRouter();
	const { organization, isLoading, error } = useOrganizations(params.id);

	const handleBack = () => {
		router.push(`/organizations/${params.id}`);
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={handleBack}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour à l'organisation
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
					<div>
						<h1 className="text-2xl font-bold mb-2">
							Formations de {organization.name}
						</h1>
						<p className="text-muted-foreground mb-6">
							Gérez les formations associées à cette organisation
						</p>

						<OrganizationTrainingsList
							organizationId={organization.id}
							trainings={organization.trainings}
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
			</div>
		</AdminLayout>
	);
}
