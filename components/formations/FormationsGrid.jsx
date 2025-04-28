// components/formations/FormationsGrid.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, FileJson } from "lucide-react";
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
import FormationActionsMenu from "@/components/formations/FormationActionsMenu";

// Configuration des couleurs selon la difficulté
const difficultyColors = {
	Débutant:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	Intermédiaire:
		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	Avancé: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

// Couleurs pour les catégories
const categoryColors = {
	Sécurité: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	Management:
		"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
	Communication:
		"bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
	Médical: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	Technique:
		"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function FormationsGrid() {
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
		<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{formations.map((formation) => (
				<Card key={formation.id} className="hover-lift">
					<CardHeader className="pb-2">
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<CardTitle
									className="cursor-pointer hover:text-primary hover:underline"
									onClick={() =>
										router.push(
											`/formations/view/${formation.id}`
										)
									}
								>
									{formation.name}
								</CardTitle>
								<CardDescription className="line-clamp-2">
									{formation.description}
								</CardDescription>
							</div>
							<FormationActionsMenu
								formation={formation}
								onDelete={() => handleDelete(formation.id)}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2 mb-4">
							<Badge
								variant="outline"
								className={
									categoryColors[formation.category] || ""
								}
							>
								{formation.category}
							</Badge>
							<Badge
								variant="outline"
								className={
									difficultyColors[formation.difficulty] || ""
								}
							>
								{formation.difficulty}
							</Badge>
							<Badge variant="outline">
								{formation.duration}
							</Badge>
						</div>
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span>{formation.contentsCount || 0} modules</span>
							<span>ID: {formation.formationId}</span>
						</div>
					</CardContent>
					<CardFooter className="border-t pt-4">
						<div className="flex w-full items-center justify-between">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									router.push(
										`/formations/edit/${formation.id}`
									)
								}
							>
								Modifier
							</Button>
							<span className="text-xs text-muted-foreground">
								Mis à jour le{" "}
								{new Date(
									formation.updatedAt
								).toLocaleDateString("fr-FR")}
							</span>
						</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
