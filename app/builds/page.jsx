"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BuildsHeader from "@/components/builds/BuildsHeader";
import BuildsList from "@/components/builds/BuildsList";

export default function BuildsPage() {
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
			<BuildsHeader />
			<BuildsList />
		</AdminLayout>
	);
}
