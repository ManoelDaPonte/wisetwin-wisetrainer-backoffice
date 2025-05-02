//components/formations/currentFormation/view/CurrentFormationActions.jsx
"use client";

import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	MoreVertical,
	Pencil,
	Copy,
	Trash,
	Download,
	Share2,
	FileText,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function FormationActions({
	formation,
	onExport,
	onDuplicate,
	onDelete,
}) {
	const router = useRouter();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState(null);

	const handleEdit = () => {
		router.push(`/formations/${formation.id}/edit`);
	};

	// Le reste du composant reste identique
	const handleExport = async () => {
		if (onExport) {
			onExport(formation.id);
		} else {
			// Implémentation par défaut
			try {
				const response = await fetch(
					`/api/formations/${formation.id}/export`
				);

				if (!response.ok) {
					throw new Error("Erreur lors de l'exportation");
				}

				const data = await response.json();

				// Créer un Blob et le télécharger
				const blob = new Blob(
					[JSON.stringify(data.formation, null, 2)],
					{ type: "application/json" }
				);
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `formation-${
					formation.externalId || formation.id
				}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} catch (err) {
				console.error("Erreur:", err);
				setError(err.message);
			}
		}
	};

	const handleDuplicate = () => {
		if (onDuplicate) {
			onDuplicate(formation.id);
		} else {
			// Implémentation par défaut
			router.push(`/formations/${formation.id}/duplicate`);
		}
	};

	const handleDeleteClick = () => {
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (onDelete) {
			setIsDeleting(true);
			try {
				await onDelete(formation.id);
				router.push("/formations");
			} catch (err) {
				setError(err.message);
			} finally {
				setIsDeleting(false);
				setShowDeleteDialog(false);
			}
		}
	};

	const cancelDelete = () => {
		setShowDeleteDialog(false);
	};

	return (
		<>
			<div className="flex gap-2">
				<Button variant="outline" size="sm" onClick={handleEdit}>
					<Pencil className="mr-2 h-4 w-4" />
					Modifier
				</Button>
				<Button variant="outline" size="sm" onClick={handleExport}>
					<FileText className="mr-2 h-4 w-4" />
					Exporter JSON
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleEdit}>
							<Pencil className="mr-2 h-4 w-4" />
							Modifier
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleDuplicate}>
							<Copy className="mr-2 h-4 w-4" />
							Dupliquer
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleExport}>
							<Download className="mr-2 h-4 w-4" />
							Exporter
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleDeleteClick}
							className="text-destructive"
						>
							<Trash className="mr-2 h-4 w-4" />
							Supprimer
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Dialog de confirmation de suppression */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmer la suppression</DialogTitle>
						<DialogDescription>
							Êtes-vous sûr de vouloir supprimer la formation{" "}
							<strong>{formation.name}</strong> ? Cette action est
							irréversible.
						</DialogDescription>
					</DialogHeader>

					{error && (
						<Alert variant="destructive">
							<AlertTitle>Erreur</AlertTitle>
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
							{isDeleting ? "Suppression..." : "Supprimer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
