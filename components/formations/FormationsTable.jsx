import { useState } from "react";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Exemple de données (à remplacer par des données réelles)
const formations = [
	{
		id: "1",
		name: "Sécurité en environnement industriel",
		category: "Sécurité",
		difficulty: "Intermédiaire",
		duration: "45 min",
		organizations: 3,
		updatedAt: "Il y a 2 jours",
	},
	{
		id: "2",
		name: "Gestion de crise",
		category: "Management",
		difficulty: "Avancé",
		duration: "60 min",
		organizations: 5,
		updatedAt: "Il y a 1 semaine",
	},
	{
		id: "3",
		name: "Initiation aux équipements de protection",
		category: "Sécurité",
		difficulty: "Débutant",
		duration: "30 min",
		organizations: 12,
		updatedAt: "Il y a 3 jours",
	},
	{
		id: "4",
		name: "Communication d'équipe efficace",
		category: "Communication",
		difficulty: "Intermédiaire",
		duration: "40 min",
		organizations: 8,
		updatedAt: "Il y a 5 jours",
	},
	{
		id: "5",
		name: "Prévention des accidents",
		category: "Sécurité",
		difficulty: "Débutant",
		duration: "25 min",
		organizations: 10,
		updatedAt: "Il y a 1 jour",
	},
];

const difficultyColors = {
	Débutant:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	Intermédiaire:
		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	Avancé: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function FormationsTable() {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nom</TableHead>
						<TableHead>Catégorie</TableHead>
						<TableHead>Difficulté</TableHead>
						<TableHead>Durée</TableHead>
						<TableHead>Organisations</TableHead>
						<TableHead>Mis à jour</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{formations.map((formation) => (
						<TableRow key={formation.id}>
							<TableCell className="font-medium">
								{formation.name}
							</TableCell>
							<TableCell>{formation.category}</TableCell>
							<TableCell>
								<Badge
									variant="outline"
									className={
										difficultyColors[formation.difficulty]
									}
								>
									{formation.difficulty}
								</Badge>
							</TableCell>
							<TableCell>{formation.duration}</TableCell>
							<TableCell>{formation.organizations}</TableCell>
							<TableCell>{formation.updatedAt}</TableCell>
							<TableCell className="text-right">
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
											<Eye className="mr-2 h-4 w-4" />
											<span>Voir les détails</span>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Edit className="mr-2 h-4 w-4" />
											<span>Modifier</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="text-destructive">
											<Trash className="mr-2 h-4 w-4" />
											<span>Supprimer</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
