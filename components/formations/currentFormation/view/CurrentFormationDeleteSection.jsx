//components/formations/currentFormation/view/CurrentFormationDeleteSection.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function CurrentFormationDeleteSection({ formation, onDelete }) {
	const router = useRouter();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState(null);

	const handleDeleteClick = () => {
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		setIsDeleting(true);
		setError(null);

		try {
			// Si une fonction onDelete est fournie, l'utiliser
			if (onDelete) {
				await onDelete(formation.id);
			} else {
				// Implémentation par défaut
				const response = await fetch(
					`/api/formations/${formation.id}`,
					{
						method: "DELETE",
					}
				);

				if (!response.ok) {
					const data = await response.json();
					throw new Error(
						data.error || "Erreur lors de la suppression"
					);
				}
			}

			// Rediriger vers la liste des formations
			router.push("/formations");
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
			setShowDeleteDialog(false);
		} finally {
			setIsDeleting(false);
		}
	};

	const cancelDelete = () => {
		setShowDeleteDialog(false);
	};

	return (
		<>
			<Card className="border-red-200 dark:border-red-800">
				<CardHeader>
					<CardTitle className="text-red-600 dark:text-red-400">
						Zone de danger
					</CardTitle>
					<CardDescription>
						Les actions ci-dessous sont irréversibles
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							La suppression d'une formation entraînera la perte
							définitive de toutes les données associées, y
							compris les modules 3D, les cours et la
							documentation.
						</p>

						{error && (
							<Alert variant="destructive">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<Button
							variant="destructive"
							onClick={handleDeleteClick}
							className="w-full sm:w-auto"
						>
							<Trash className="mr-2 h-4 w-4" />
							Supprimer définitivement cette formation
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Dialog de confirmation de suppression */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmer la suppression</DialogTitle>
						<DialogDescription>
							Êtes-vous sûr de vouloir supprimer la formation{" "}
							<strong>{formation.name}</strong> ? Cette action est
							irréversible et supprimera tous les modules 3D,
							cours et documents associés.
						</DialogDescription>
					</DialogHeader>

					{error && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={cancelDelete}
							disabled={isDeleting}
						>
							Annuler
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={isDeleting}
						>
							{isDeleting
								? "Suppression..."
								: "Supprimer définitivement"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
