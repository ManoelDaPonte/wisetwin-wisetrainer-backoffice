//components/organizations/currentOrganization/OrganizationBuildsOverview.jsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CurrentOrganizationBuildsOverview({ organizationId }) {
	const router = useRouter();
	const [buildsCount, setBuildsCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchBuildsCount = async () => {
			try {
				const response = await fetch(
					`/api/organizations/${organizationId}/builds/count`
				);
				if (response.ok) {
					const data = await response.json();
					setBuildsCount(data.count);
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération du nombre de builds:",
					error
				);
				setBuildsCount(0);
			} finally {
				setIsLoading(false);
			}
		};

		if (organizationId) {
			fetchBuildsCount();
		}
	}, [organizationId]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<Package className="h-6 w-6 text-primary" />
					Builds Unity
				</CardTitle>
				<CardDescription>
					Vue d'ensemble des builds disponibles
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Chargement...</span>
							</div>
						) : (
							<p className="text-2xl font-bold">
								{buildsCount} builds
							</p>
						)}
					</div>
					<Button
						onClick={() =>
							router.push(
								`/organizations/${organizationId}/builds`
							)
						}
					>
						Gérer les builds
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
