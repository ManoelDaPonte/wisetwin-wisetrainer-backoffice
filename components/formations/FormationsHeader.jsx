// components/formations/FormationsHeader.jsx
import { Upload, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FormationsHeader({
	onCreateClick,
	onImportClick,
	searchQuery = "",
	onSearchChange = () => {},
}) {
	return (
		<div className="space-y-4">
			{/* Titre et boutons d'action */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Formations</h1>
					<p className="text-muted-foreground">
						Gérez les formations et leurs contenus
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={onImportClick}>
						<Upload className="mr-2 h-4 w-4" />
						Importer un JSON
					</Button>
					<Button onClick={onCreateClick}>
						<Plus className="mr-2 h-4 w-4" />
						Nouvelle formation
					</Button>
				</div>
			</div>

			{/* Barre de recherche */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Rechercher des formations..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
				{/* Espace pour d'éventuels filtres supplémentaires */}
			</div>
		</div>
	);
}
