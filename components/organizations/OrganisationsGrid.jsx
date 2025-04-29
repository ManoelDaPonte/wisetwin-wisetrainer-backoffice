import { useState } from "react";
import { MoreHorizontal, Users, Building, BookOpen } from "lucide-react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Exemple de données (à remplacer par des données réelles)
const organisations = [
	{
		id: "1",
		name: "Entreprise ABC",
		description: "Grande entreprise industrielle",
		logoUrl: null,
		isActive: true,
		members: 32,
		trainings: 8,
		createdAt: "12/03/2025",
	},
	{
		id: "2",
		name: "StartUp XYZ",
		description: "Startup technologique en croissance",
		logoUrl: null,
		isActive: true,
		members: 15,
		trainings: 5,
		createdAt: "05/02/2025",
	},
	{
		id: "3",
		name: "Association DEF",
		description: "Association professionnelle sectorielle",
		logoUrl: null,
		isActive: false,
		members: 54,
		trainings: 12,
		createdAt: "23/01/2025",
	},
	{
		id: "4",
		name: "Société GHI",
		description: "Entreprise de services",
		logoUrl: null,
		isActive: true,
		members: 28,
		trainings: 6,
		createdAt: "18/04/2025",
	},
	{
		id: "5",
		name: "Corporation JKL",
		description: "Groupe multinational",
		logoUrl: null,
		isActive: true,
		members: 120,
		trainings: 15,
		createdAt: "02/04/2025",
	},
	{
		id: "6",
		name: "Coopérative MNO",
		description: "Coopérative locale",
		logoUrl: null,
		isActive: true,
		members: 42,
		trainings: 9,
		createdAt: "08/03/2025",
	},
];

export default function OrganisationsGrid() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{organisations.map((org) => (
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
									{org.description}
								</CardDescription>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>
										Actions
									</DropdownMenuLabel>
									<DropdownMenuItem>
										Voir les détails
									</DropdownMenuItem>
									<DropdownMenuItem>
										Modifier
									</DropdownMenuItem>
									<DropdownMenuItem>
										Gérer les membres
									</DropdownMenuItem>
									<DropdownMenuItem>
										Attribuer des formations
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="text-destructive">
										Supprimer
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<div className="mt-1">
							{org.isActive ? (
								<Badge
									variant="outline"
									className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
								>
									Actif
								</Badge>
							) : (
								<Badge
									variant="outline"
									className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
								>
									Inactif
								</Badge>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between py-2">
							<div className="flex items-center">
								<Users className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>{org.members} membres</span>
							</div>
							<div className="flex items-center">
								<BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
								<span>{org.trainings} formations</span>
							</div>
						</div>
					</CardContent>
					<CardFooter className="border-t bg-muted/30 py-2 text-sm text-muted-foreground">
						<div className="flex items-center">
							<Building className="mr-2 h-3 w-3" />
							<span>Créée le {org.createdAt}</span>
						</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
