// components/dashboard/OrganizationSummary.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Building,
	Users,
	BookOpen,
	Loader2,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function OrganizationSummary() {
	const router = useRouter();
	const [organizations, setOrganizations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchOrganizations();
	}, []);

	const fetchOrganizations = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/organizations?limit=3");

			if (!response.ok) {
				throw new Error(
					"Erreur lors de la récupération des organisations"
				);
			}

			const data = await response.json();
			setOrganizations(data.organizations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Organisations</CardTitle>
					<CardDescription>Récentes organisations</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center py-6">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Organisations</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Organisations</CardTitle>
					<CardDescription>Récentes organisations</CardDescription>
				</div>
				<Building className="h-5 w-5 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{organizations.length === 0 ? (
						<div className="text-center py-3 text-muted-foreground">
							Aucune organisation trouvée
						</div>
					) : (
						organizations.map((org) => (
							<div
								key={org.id}
								className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
							>
								<div>
									<h3 className="font-medium">{org.name}</h3>
									<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
										<div className="flex items-center gap-1">
											<Users className="h-3 w-3" />
											<span>{org.membersCount || 0}</span>
										</div>
										<div className="flex items-center gap-1">
											<BookOpen className="h-3 w-3" />
											<span>
												{org.trainingsCount || 0}
											</span>
										</div>
									</div>
								</div>
								<Badge
									variant="outline"
									className={
										org.isActive
											? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
											: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
									}
								>
									{org.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
						))
					)}
				</div>
			</CardContent>
			<CardFooter>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => router.push("/organizations")}
				>
					Voir toutes les organisations
				</Button>
			</CardFooter>
		</Card>
	);
}
