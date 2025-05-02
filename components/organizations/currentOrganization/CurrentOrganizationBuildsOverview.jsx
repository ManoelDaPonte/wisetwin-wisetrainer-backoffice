//components/organizations/currentOrganization/CurrentOrganizationBuildsOverview.jsx
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
import { useOrganizationBuilds } from "@/lib/hooks/builds/useOrganizationBuilds";

export default function CurrentOrganizationBuildsOverview({ organizationId }) {
	const router = useRouter();
	const { builds, isLoading } = useOrganizationBuilds(organizationId);
	const buildsCount = builds ? builds.length : 0;

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
