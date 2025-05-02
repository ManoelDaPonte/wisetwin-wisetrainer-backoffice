//components/organizations/currentOrganization/builds/AssignFormationDialog.jsx
"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFormations } from "@/lib/hooks/formations/useFormations";

export default function BuildAssignFormationDialog({
	isOpen,
	onClose,
	onAssign,
	build,
}) {
	const { formations, isLoading, error } = useFormations();
	const [selectedFormationId, setSelectedFormationId] = useState("");
	const [localError, setLocalError] = useState(null);

	// Sélectionner la première formation par défaut s'il y en a
	useEffect(() => {
		if (formations.length > 0 && !selectedFormationId) {
			setSelectedFormationId(formations[0].id);
		}
	}, [formations, selectedFormationId]);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!selectedFormationId) {
			setLocalError("Veuillez sélectionner une formation");
			return;
		}

		onAssign(selectedFormationId);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Assigner une formation au build</DialogTitle>
				</DialogHeader>

				{(error || localError) && (
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							{error || localError}
						</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="buildInfo">Build sélectionné</Label>
						<div className="p-2 border rounded bg-muted/20">
							<p className="font-medium">{build?.name}</p>
							<p className="text-sm text-muted-foreground">
								Version: {build?.version || "-"}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="formation">Formation</Label>
						{isLoading ? (
							<div className="flex items-center space-x-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-sm">
									Chargement des formations...
								</span>
							</div>
						) : formations.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								Aucune formation disponible
							</p>
						) : (
							<Select
								value={selectedFormationId}
								onValueChange={setSelectedFormationId}
							>
								<SelectTrigger id="formation">
									<SelectValue placeholder="Sélectionner une formation" />
								</SelectTrigger>
								<SelectContent>
									{formations.map((formation) => (
										<SelectItem
											key={formation.id}
											value={formation.id}
										>
											{formation.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							disabled={
								isLoading ||
								formations.length === 0 ||
								!selectedFormationId
							}
						>
							Assigner
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
