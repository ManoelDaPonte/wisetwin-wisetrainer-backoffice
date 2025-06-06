// components/formations/FormationsTable.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	MoreHorizontal,
	Edit,
	Trash,
	Eye,
	Copy,
	Loader2,
	AlertTriangle,
	FileJson,
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import FormationActionsMenu from "@/components/formations/FormationActionsMenu";

// Configuration des couleurs selon la difficulté
const difficultyColors = {
	Débutant:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	Intermédiaire:
		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	Avancé: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function FormationsTable() {
	const router = useRouter();
	const [formations, setFormations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	useEffect(() => {
		fetchFormations();
	}, []);

	const fetchFormations = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/formations");
			if (!response.ok) {
				throw new Error("Erreur lors du chargement des formations");
			}
			const data = await response.json();
			setFormations(data.formations || []);
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (
			!window.confirm(
				"Êtes-vous sûr de vouloir supprimer cette formation ?"
			)
		) {
			return;
		}

		setDeleteId(id);
		try {
			const response = await fetch(`/api/formations/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erreur lors de la suppression");
			}

			// Mettre à jour la liste
			fetchFormations();
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setDeleteId(null);
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
			<Alert variant="destructive" className="my-4">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (formations.length === 0) {
		return (
			<div className="text-center py-12 border rounded-md">
				<FileJson className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<p className="text-muted-foreground mb-4">
					Aucune formation trouvée. Commencez par en créer une ou
					importer un JSON.
				</p>
				<div className="flex justify-center gap-4">
					<Button
						variant="outline"
						onClick={() => router.push("/formations/create")}
					>
						Créer une formation
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nom</TableHead>
						<TableHead>Catégorie</TableHead>
						<TableHead>Difficulté</TableHead>
						<TableHead>Durée</TableHead>
						<TableHead>Modules</TableHead>
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
										difficultyColors[
											formation.difficulty
										] || ""
									}
								>
									{formation.difficulty}
								</Badge>
							</TableCell>
							<TableCell>{formation.duration}</TableCell>
							<TableCell>
								{formation.contentsCount || 0}
							</TableCell>
							<TableCell>
								{new Date(
									formation.updatedAt
								).toLocaleDateString("fr-FR")}
							</TableCell>
							<TableCell className="text-right">
								{deleteId === formation.id ? (
									<Loader2 className="h-4 w-4 ml-auto animate-spin" />
								) : (
									<FormationActionsMenu
										formation={formation}
										onDelete={() =>
											handleDelete(formation.id)
										}
									/>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
