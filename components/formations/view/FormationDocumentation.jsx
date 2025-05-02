//components/formations/view/FormationDocumentation.jsx
"use client";

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
	FileText,
	PlusCircle,
	ChevronRight,
	CalendarDays,
	FileType2,
	Edit,
	Eye,
	Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function FormationDocumentation({
	formation,
	isPreview = false,
}) {
	const router = useRouter();
}

const documentation = formation?.documentation || [];

const handleAddDocument = () => {
	// Rediriger vers la page d'ajout ou ouvrir un modal
	router.push(`/formations/edit/${formation.id}/add-documentation`);
};

const handleEditDocument = (docId) => {
	router.push(`/formations/edit/${formation.id}/documentation/${docId}`);
};

const handleViewDocument = (docId) => {
	router.push(`/formations/view/${formation.id}/documentation/${docId}`);
};

// Pour l'aperçu, afficher uniquement les 2 premiers documents
const displayedDocs = isPreview ? documentation.slice(0, 2) : documentation;

// Fonction pour obtenir l'icône selon le type de document
const getTypeIcon = (type) => {
	switch (type?.toLowerCase()) {
		case "article":
			return <FileText className="mr-1 h-3 w-3" />;
		case "resource":
			return <Download className="mr-1 h-3 w-3" />;
		case "faq":
			return <FileType2 className="mr-1 h-3 w-3" />;
		default:
			return <FileText className="mr-1 h-3 w-3" />;
	}
};

return (
	<Card>
		<CardHeader className="pb-3">
			<div className="flex justify-between items-center">
				<div className="flex items-center">
					<FileText className="mr-2 h-5 w-5 text-wisetwin-blue" />
					<CardTitle>Documentation</CardTitle>
				</div>
				<Button onClick={handleAddDocument} size="sm">
					<PlusCircle className="mr-2 h-4 w-4" />
					Ajouter un document
				</Button>
			</div>
			<CardDescription>
				Ressources documentaires supplémentaires
			</CardDescription>
		</CardHeader>
		<CardContent>
			{displayedDocs.length === 0 ? (
				<div className="text-center py-8 border rounded-md">
					<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground mb-2">
						Aucune documentation disponible
					</p>
					<p className="text-sm text-muted-foreground">
						Cliquez sur "Ajouter un document" pour commencer
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{displayedDocs.map((doc) => (
						<div
							key={doc.id}
							className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-md hover:bg-muted/20 transition-colors"
						>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<h3 className="font-medium">{doc.title}</h3>
									<Badge
										variant="outline"
										className="capitalize"
									>
										{doc.type || "Document"}
									</Badge>
									{!doc.isActive && (
										<Badge
											variant="outline"
											className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
										>
											Inactif
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{doc.description || "Aucune description"}
								</p>
								<div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
									<div className="flex items-center">
										<CalendarDays className="mr-1 h-3 w-3" />
										<span>
											Mis à jour:{" "}
											{new Date(
												doc.updatedAt
											).toLocaleDateString("fr-FR")}
										</span>
									</div>
									<div className="flex items-center">
										{getTypeIcon(doc.type)}
										<span>{doc.type || "Document"}</span>
									</div>
								</div>
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleEditDocument(doc.id)}
								>
									<Edit className="mr-2 h-4 w-4" />
									Modifier
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleViewDocument(doc.id)}
								>
									<Eye className="mr-2 h-4 w-4" />
									Voir
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</CardContent>
		{isPreview && documentation.length > 2 && (
			<CardFooter className="border-t">
				<Button
					variant="ghost"
					size="sm"
					className="ml-auto"
					onClick={() =>
						router.push(`/formations/view/${formation.id}`)
					}
				>
					Voir toute la documentation ({documentation.length})
					<ChevronRight className="ml-1 h-4 w-4" />
				</Button>
			</CardFooter>
		)}
	</Card>
);
