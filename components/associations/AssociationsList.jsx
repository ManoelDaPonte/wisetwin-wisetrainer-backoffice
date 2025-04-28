// components/associations/AssociationsList.jsx
import { Loader2, Link, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AssociationCard from "./AssociationCard";

export default function AssociationsList({
	associations,
	isLoading,
	error,
	filterType,
	onRemoveAssociation,
	isRemoving,
}) {
	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (associations.length === 0) {
		return (
			<div className="text-center p-12 border rounded-md">
				<Link className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<h3 className="text-lg font-medium mb-2">
					Aucune association trouvée
				</h3>
				<p className="text-muted-foreground mb-4">
					{filterType === "with-build"
						? "Aucune formation n'est associée à un build."
						: filterType === "without-build"
						? "Toutes les formations sont associées à un build."
						: "Aucune formation ne correspond à votre recherche."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{associations.map((formation) => (
				<AssociationCard
					key={formation.id}
					formation={formation}
					onRemoveAssociation={onRemoveAssociation}
					isRemoving={isRemoving}
				/>
			))}
		</div>
	);
}
