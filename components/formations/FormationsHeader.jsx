import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FormationsHeader() {
	return (
		<div className="mb-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Formations</h1>
					<p className="text-muted-foreground">
						Gérez les formations et leurs contenus
					</p>
				</div>
				<Button>
					<PlusCircle className="mr-2 h-4 w-4" />
					Nouvelle formation
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Rechercher des formations..."
						className="pl-8"
					/>
				</div>
				<Button variant="outline">Filtres</Button>
			</div>
		</div>
	);
}
