// components/formations/FormationActionsMenu.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	MoreHorizontal,
	Edit,
	Trash,
	Eye,
	Copy,
	FileJson,
	Download,
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

export default function FormationActionsMenu({ formation, onDelete }) {
	const router = useRouter();
	const [isExporting, setIsExporting] = useState(false);

	const handleDuplicate = async () => {
		try {
			const response = await fetch(
				`/api/formations/duplicate/${formation.id}`,
				{
					method: "POST",
				}
			);

			if (!response.ok) {
				throw new Error("Erreur lors de la duplication");
			}

			const data = await response.json();
			// Rediriger vers l'édition de la formation dupliquée
			router.push(`/formations/edit/${data.id}`);
		} catch (err) {
			console.error("Erreur:", err);
			alert("Erreur lors de la duplication: " + err.message);
		}
	};

	const handleExportJson = async () => {
		setIsExporting(true);
		try {
			const response = await fetch(
				`/api/formations/export/${formation.id}`
			);

			if (!response.ok) {
				throw new Error("Erreur lors de l'exportation");
			}

			const data = await response.json();

			// Créer un objet Blob et générer une URL
			const blob = new Blob([JSON.stringify(data.formation, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);

			// Créer un lien temporaire pour télécharger le fichier
			const a = document.createElement("a");
			a.href = url;
			a.download = `${formation.formationId || formation.id}.json`;
			document.body.appendChild(a);
			a.click();

			// Nettoyer
			setTimeout(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 100);
		} catch (err) {
			console.error("Erreur:", err);
			alert("Erreur lors de l'exportation: " + err.message);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>

				<DropdownMenuItem
					onClick={() =>
						router.push(`/formations/view/${formation.id}`)
					}
				>
					<Eye className="mr-2 h-4 w-4" />
					<span>Voir les détails</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() =>
						router.push(`/formations/edit/${formation.id}`)
					}
				>
					<Edit className="mr-2 h-4 w-4" />
					<span>Modifier</span>
				</DropdownMenuItem>

				<DropdownMenuItem onClick={handleDuplicate}>
					<Copy className="mr-2 h-4 w-4" />
					<span>Dupliquer</span>
				</DropdownMenuItem>

				<DropdownMenuItem onClick={handleExportJson}>
					<FileJson className="mr-2 h-4 w-4" />
					<span>Exporter JSON</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					className="text-destructive"
					onClick={onDelete}
				>
					<Trash className="mr-2 h-4 w-4" />
					<span>Supprimer</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
