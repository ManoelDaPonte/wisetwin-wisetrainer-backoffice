"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import FormationsStats from "@/components/dashboard/FormationsStats";

export default function DashboardPage() {
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
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Tableau de bord</h1>
				<p className="text-muted-foreground">
					Bienvenue sur votre portail d'administration
				</p>
			</div>

			<StatsCards />

			<div className="mt-6 space-y-6">
				<FormationsStats />

				<div className="grid gap-6 lg:grid-cols-2">
					<RecentActivity />
					<QuickActions />
				</div>
			</div>
		</AdminLayout>
	);
}
