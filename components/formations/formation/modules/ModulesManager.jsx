// components/formations/ModulesManager.jsx
"use client";

import { useState } from "react";
import {
	Pencil,
	Trash,
	Plus,
	ArrowUp,
	ArrowDown,
	Footprints,
	HelpCircle,
	MoreHorizontal,
	Loader2,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ModuleEditDialog from "./ModuleEditDialog";

export default function ModulesManager({ formation, onUpdate }) {
	const [isAddingModule, setIsAddingModule] = useState(false);
	const [editingModule, setEditingModule] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [processingModule, setProcessingModule] = useState(null);
	const [error, setError] = useState(null);

	const handleAddModule = () => {
		setEditingModule(null);
		setIsAddingModule(true);
	};

	const handleEditModule = (module) => {
		setEditingModule(module);
		setIsAddingModule(true);
	};

	const handleDeleteModule = async (moduleId) => {
		if (
			!window.confirm(
				"Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible."
			)
		) {
			return;
		}

		setProcessingModule(moduleId);
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${formation.id}/modules/${moduleId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de la suppression du module"
				);
			}

			// Mettre à jour la liste des modules
			if (onUpdate) {
				onUpdate();
			}
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
			setProcessingModule(null);
		}
	};

	const handleSaveModule = async (moduleData) => {
		setIsLoading(true);
		setError(null);

		try {
			// Déterminer s'il s'agit d'une création ou d'une mise à jour
			const isEdit = !!editingModule;
			const url = isEdit
				? `/api/formations/${formation.id}/modules/${editingModule.id}`
				: `/api/formations/${formation.id}/modules`;

			const response = await fetch(url, {
				method: isEdit ? "PATCH" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(moduleData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error ||
						`Erreur lors de ${
							isEdit ? "la mise à jour" : "la création"
						} du module`
				);
			}

			// Fermer le dialogue
			setIsAddingModule(false);
			setEditingModule(null);

			// Mettre à jour la liste des modules
			if (onUpdate) {
				onUpdate();
			}
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMoveModule = async (moduleId, direction) => {
		setProcessingModule(moduleId);
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/formations/${formation.id}/modules/${moduleId}/move`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ direction }),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors du déplacement du module"
				);
			}

			// Mettre à jour la liste des modules
			if (onUpdate) {
				onUpdate();
			}
		} catch (err) {
			console.error("Erreur:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
			setProcessingModule(null);
		}
	};

	// Tri des modules par ordre
	const sortedContents = [...(formation.contents || [])].sort(
		(a, b) => a.order - b.order
	);

	return (
		<div className="space-y-4">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">
					Modules ({sortedContents.length})
				</h2>
				<Button onClick={handleAddModule}>
					<Plus className="mr-2 h-4 w-4" />
					Ajouter un module
				</Button>
			</div>

			{sortedContents.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center p-6">
						<p className="mb-4 text-muted-foreground">
							Aucun module n'a été ajouté à cette formation.
						</p>
						<Button onClick={handleAddModule}>
							<Plus className="mr-2 h-4 w-4" />
							Ajouter un premier module
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{sortedContents.map((module, index) => (
						<Card
							key={module.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{module.type === "guide" ? (
											<Footprints className="h-5 w-5 text-primary" />
										) : (
											<HelpCircle className="h-5 w-5 text-amber-500" />
										)}
										<CardTitle className="text-lg">
											{module.title}
										</CardTitle>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline">
											{module.type === "guide"
												? "Guide interactif"
												: "Questionnaire"}
										</Badge>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
												>
													{processingModule ===
													module.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<MoreHorizontal className="h-4 w-4" />
													)}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>
													Actions
												</DropdownMenuLabel>
												<DropdownMenuItem
													onClick={() =>
														handleEditModule(module)
													}
												>
													<Pencil className="mr-2 h-4 w-4" />
													<span>Modifier</span>
												</DropdownMenuItem>

												{index > 0 && (
													<DropdownMenuItem
														onClick={() =>
															handleMoveModule(
																module.id,
																"up"
															)
														}
													>
														<ArrowUp className="mr-2 h-4 w-4" />
														<span>Monter</span>
													</DropdownMenuItem>
												)}

												{index <
													sortedContents.length -
														1 && (
													<DropdownMenuItem
														onClick={() =>
															handleMoveModule(
																module.id,
																"down"
															)
														}
													>
														<ArrowDown className="mr-2 h-4 w-4" />
														<span>Descendre</span>
													</DropdownMenuItem>
												)}

												<DropdownMenuSeparator />

												<DropdownMenuItem
													className="text-destructive"
													onClick={() =>
														handleDeleteModule(
															module.id
														)
													}
												>
													<Trash className="mr-2 h-4 w-4" />
													<span>Supprimer</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
								<CardDescription>
									{module.description}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-muted-foreground">
									{module.type === "guide" ? (
										<div className="flex items-center justify-between">
											<span>
												{module.steps?.length || 0}{" "}
												étapes
											</span>
											<Badge
												variant="outline"
												className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
											>
												Ordre: {module.order}
											</Badge>
										</div>
									) : (
										<div className="flex items-center justify-between">
											<span>
												{module.questions?.length || 0}{" "}
												questions
											</span>
											<Badge
												variant="outline"
												className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
											>
												Ordre: {module.order}
											</Badge>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Modal d'édition du module */}
			<ModuleEditDialog
				isOpen={isAddingModule}
				onClose={() => {
					setIsAddingModule(false);
					setEditingModule(null);
				}}
				onSave={handleSaveModule}
				module={editingModule}
				formationId={formation.id}
				isLoading={isLoading}
			/>
		</div>
	);
}
