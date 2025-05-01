// app/organizations/page.jsx
"use client";

import { useAuth } from "@/lib/hooks/auth/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import OrganizationsHeader from "@/components/organizations/OrganizationsHeader";
import OrganizationsList from "@/components/organizations/OrganizationsList";
import { useOrganizations } from "@/lib/hooks/organizations/useOrganizations";

export default function OrganizationsPage() {
	const { loading } = useAuth();
	const { isLoading, error, searchQuery, setSearchQuery } =
		useOrganizations();

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
				/>

				<OrganizationsList />
			</div>
		</AdminLayout>
	);
}
