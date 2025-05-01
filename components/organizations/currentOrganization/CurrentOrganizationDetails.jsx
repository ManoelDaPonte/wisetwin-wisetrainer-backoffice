//components/organizations/currentOrganization/OrganizationDetails.jsx
"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Clock } from "lucide-react";

export default function CurrentOrganizationDetails({ organization }) {
	if (!organization) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<Building className="h-6 w-6 text-primary" />
					{organization.name}
				</CardTitle>
				<CardDescription>
					Informations de l'organisation
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Description
						</h3>
						<p className="text-sm">
							{organization.description || "Aucune description"}
						</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Statut
						</h3>
						<Badge
							variant={
								organization.isActive ? "default" : "secondary"
							}
						>
							{organization.isActive ? "Active" : "Inactive"}
						</Badge>
					</div>

					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Container Azure
						</h3>
						<p className="text-sm">
							{organization.azureContainer || "Non défini"}
						</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Créée le
						</h3>
						<div className="flex items-center gap-2 text-sm">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							{new Date(
								organization.createdAt
							).toLocaleDateString("fr-FR")}
						</div>
					</div>

					<div>
						<h3 className="text-sm font-medium text-muted-foreground mb-2">
							Dernière mise à jour
						</h3>
						<div className="flex items-center gap-2 text-sm">
							<Clock className="h-4 w-4 text-muted-foreground" />
							{new Date(
								organization.updatedAt
							).toLocaleDateString("fr-FR")}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
