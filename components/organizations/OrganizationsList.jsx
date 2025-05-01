//components/organizations/OrganizationsList.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Loader2,
	Building,
	AlertTriangle,
	MoreHorizontal,
	Users,
	Package,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizations } from "@/lib/hooks/organizations/useOrganizations";

export default function OrganizationsList() {
	const router = useRouter();
	const { organizations, isLoading, error, refreshOrganizations } =
		useOrganizations();
	const [deletingId, setDeletingId] = useState(null);
	const [organizationBuilds, setOrganizationBuilds] = useState({});

	// Récupérer le nombre de builds pour chaque organisation
	useEffect(() => {
		const fetchBuildsCount = async () => {
			const buildsData = {};

			for (const org of organizations) {
				try {
					const response = await fetch(
						`/api/organizations/${org.id}/builds/count`
					);
					if (response.ok) {
						const data = await response.json();
						buildsData[org.id] = data.count;
					} else {
						buildsData[org.id] = 0;
					}
				} catch (error) {
					console.error(
						`Erreur lors de la récupération des builds pour ${org.id}:`,
						error
					);
					buildsData[org.id] = 0;
				}
			}

			setOrganizationBuilds(buildsData);
		};

		if (organizations.length > 0) {
			fetchBuildsCount();
		}
	}, [organizations]);

	const handleDeleteOrganization = async (id) => {
		if (
			!confirm("Êtes-vous sûr de vouloir supprimer cette organisation ?")
		) {
			return;
		}

		setDeletingId(id);
		try {
			const response = await fetch(`/api/organizations/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression");
			}

			refreshOrganizations();
		} catch (err) {
			console.error("Erreur:", err);
			alert("Erreur lors de la suppression: " + err.message);
		} finally {
			setDeletingId(null);
		}
	};

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
					className="hover-lift transition-all overflow-hidden"
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
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										{deletingId === org.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<MoreHorizontal className="h-4 w-4" />
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>
										Actions
									</DropdownMenuLabel>
									<DropdownMenuItem
										onClick={() =>
											router.push(
												`/organizations/${org.id}`
											)
										}
									>
										Voir les détails
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											router.push(
												`/organizations/edit/${org.id}`
											)
										}
									>
										Modifier
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											router.push(
												`/organizations/${org.id}/builds`
											)
										}
									>
										Gérer les builds
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive"
										onClick={() =>
											handleDeleteOrganization(org.id)
										}
									>
										Supprimer
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
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
								<span>
									{organizationBuilds[org.id] || 0} builds
								</span>
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
