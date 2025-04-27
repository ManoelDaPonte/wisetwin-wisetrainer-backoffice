"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import FormationsTable from "@/components/formations/FormationsTable";
import FormationsHeader from "@/components/formations/FormationsHeader";

export default function FormationsPage() {
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
			<FormationsHeader />
			<FormationsTable />
		</AdminLayout>
	);
}
