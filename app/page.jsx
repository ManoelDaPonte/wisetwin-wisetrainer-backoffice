// app/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import FormationsStats from "@/components/dashboard/FormationsStats";
import OrganizationSummary from "@/components/dashboard/OrganizationSummary";
import BuildsSummary from "@/components/dashboard/BuildsSummary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function DashboardPage() {
	const { loading } = useAuth();
	const [dashboardData, setDashboardData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!loading) {
			fetchDashboardData();
		}
	}, [loading]);

	const fetchDashboardData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/dashboard");

			if (!response.ok) {
				throw new Error("Erreur lors du chargement des données");
			}

			const data = await response.json();
			setDashboardData(data);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
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
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Tableau de bord</h1>
				<p className="text-muted-foreground">
					Bienvenue sur votre portail d'administration
				</p>
			</div>

			{error ? (
				<Alert variant="destructive" className="mb-6">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						{error}. Les statistiques peuvent être partielles.
					</AlertDescription>
				</Alert>
			) : null}

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<>
					<DashboardStats data={dashboardData} />

					<div className="mt-6 space-y-6">
						<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
							<FormationsStats
								data={dashboardData?.formationsStats}
							/>
							<OrganizationSummary
								data={dashboardData?.organizations}
							/>
						</div>

						<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
							<RecentActivity
								data={dashboardData?.recentActivity}
							/>
							<div className="space-y-6">
								<QuickActions />
								<BuildsSummary data={dashboardData?.builds} />
							</div>
						</div>
					</div>
				</>
			)}
		</AdminLayout>
	);
}
