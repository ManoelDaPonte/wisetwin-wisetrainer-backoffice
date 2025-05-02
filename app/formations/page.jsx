//app/formations/page.jsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/auth/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import FormationsContainer from "@/components/formations/FormationsContainer";

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
			<FormationsContainer />
		</AdminLayout>
	);
}
