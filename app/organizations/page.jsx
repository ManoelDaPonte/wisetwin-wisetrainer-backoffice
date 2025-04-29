// app/organizations/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import OrganizationsHeader from "@/components/organizations/OrganizationsHeader";
import OrganizationsList from "@/components/organizations/OrganizationsList";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import OrganizationForm from "@/components/organizations/OrganizationForm";
import { useOrganizations } from "@/hooks/useOrganizations";

export default function OrganizationsPage() {
	const { loading } = useAuth();
	const router = useRouter();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const {
		organizations,
		isLoading,
		error,
		searchQuery,
		setSearchQuery,
		createOrganization,
	} = useOrganizations();

	const handleCreateOrganization = async (formData) => {
		setIsSaving(true);
		try {
			const newOrganization = await createOrganization(formData);
			if (newOrganization) {
				setIsCreateDialogOpen(false);
				// Optionnel: rediriger vers la page de détails de la nouvelle organisation
				router.push(`/organizations/${newOrganization.id}`);
			}
		} finally {
			setIsSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-lg font-medium">Chargement...</span>
			</div>
		);
	}

	return (
		<AdminLayout>
			<div className="space-y-6">
				<OrganizationsHeader
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onCreateClick={() => setIsCreateDialogOpen(true)}
				/>

				<OrganizationsList
					organizations={organizations}
					isLoading={isLoading}
					error={error}
				/>

				{/* Dialog de création d'organisation */}
				<Dialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}
				>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>
								Créer une nouvelle organisation
							</DialogTitle>
							<DialogDescription>
								Remplissez les informations pour créer une
								nouvelle organisation
							</DialogDescription>
						</DialogHeader>

						<OrganizationForm
							isNew={true}
							onSubmit={handleCreateOrganization}
							isSaving={isSaving}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</AdminLayout>
	);
}
