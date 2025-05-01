//components/organizations/OrganizationsList.jsx
"use client";

import { useRouter } from "next/navigation";
import { Loader2, Building, AlertTriangle, Users, Package } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrganizations } from "@/lib/hooks/organizations/useOrganizations";

export default function OrganizationsList() {
	const router = useRouter();
	const { organizations, isLoading, error } = useOrganizations();

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (organizations.length === 0) {
		return (
			<div className="text-center py-12 border rounded-md">
				<Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground mb-4">
					Aucune organisation trouvée.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{organizations.map((org) => (
				<Card
					key={org.id}
					className="hover-lift transition-all overflow-hidden cursor-pointer hover:border-primary/50"
					onClick={() => router.push(`/organizations/${org.id}`)}
				>
					<CardHeader className="pb-2">
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<CardTitle className="text-lg">
									{org.name}
								</CardTitle>
								<CardDescription className="line-clamp-2">
									{org.description || "Aucune description"}
								</CardDescription>
							</div>
						</div>
						<div className="mt-1">
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
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between py-2">
							<div className="flex items-center">
								<Users className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>{org.membersCount || 0} membres</span>
							</div>
							<div className="flex items-center">
								<Package className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>{org.buildsCount || 0} builds</span>
							</div>
						</div>
					</CardContent>
					<CardFooter className="border-t bg-muted/30 py-2 text-sm text-muted-foreground">
						<div className="flex items-center">
							<Building className="mr-2 h-3 w-3" />
							<span>
								Container: {org.azureContainer || "Non défini"}
							</span>
						</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
