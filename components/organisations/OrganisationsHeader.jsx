import { PlusCircle, Search, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function OrganisationsHeader() {
	return (
		<div className="mb-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Organisations</h1>
					<p className="text-muted-foreground">
						Gérez les organisations et leurs accès
					</p>
				</div>
				<Button>
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
					/>
				</div>
				<Button variant="outline">Filtres</Button>
				<ToggleGroup type="single" defaultValue="grid">
					<ToggleGroupItem value="grid">
						<LayoutGrid className="h-4 w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem value="list">
						<List className="h-4 w-4" />
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
		</div>
	);
}
