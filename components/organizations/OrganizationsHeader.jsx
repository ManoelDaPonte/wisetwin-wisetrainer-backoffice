// components/organizations/OrganizationsHeader.jsx
import { PlusCircle, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrganizationsHeader({
	searchQuery = "",
	onSearchChange = () => {},
	onCreateClick = () => {},
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Organisations</h1>
					<p className="text-muted-foreground">
						Gérez les organisations et leurs accès
					</p>
				</div>
				<Button onClick={onCreateClick}>
					<PlusCircle className="mr-2 h-4 w-4" />
					Nouvelle organisation
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Rechercher des organisations..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
				<Button variant="outline">Filtres</Button>
			</div>
		</div>
	);
}
