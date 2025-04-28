// app/organizations/page.jsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import OrganizationsHeader from "@/components/organizations/OrganizationsHeader";
import OrganizationsList from "@/components/organizations/OrganizationsList";

export default function OrganizationsPage() {
	const { loading } = useAuth();

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
			<OrganizationsHeader />
			<OrganizationsList />
		</AdminLayout>
	);
}
