// components/formations/modules/StepsList.jsx
"use client";

import { useState } from "react";
import {
	Plus,
	Pencil,
	Trash,
	ArrowUp,
	ArrowDown,
	Grip,
	AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import StepForm from "./StepForm";

export default function StepsList({ steps = [], onChange, disabled = false }) {
	const [editingStep, setEditingStep] = useState(null);
	const [isAddingStep, setIsAddingStep] = useState(false);
	const [draggedIndex, setDraggedIndex] = useState(null);

	const handleAddStep = () => {
		setEditingStep(null);
		setIsAddingStep(true);
	};

	const handleEditStep = (step, index) => {
		setEditingStep({ ...step, index });
		setIsAddingStep(true);
	};

	const handleDeleteStep = (index) => {
		if (
			!window.confirm("Êtes-vous sûr de vouloir supprimer cette étape ?")
		) {
			return;
		}

		const newSteps = [...steps];
		newSteps.splice(index, 1);
		onChange(newSteps);
	};

	const handleSaveStep = (stepData) => {
		const newSteps = [...steps];

		if (editingStep !== null) {
			// Mise à jour d'une étape existante
			newSteps[editingStep.index] = stepData;
		} else {
			// Ajout d'une nouvelle étape
			newSteps.push(stepData);
		}

		onChange(newSteps);
		setIsAddingStep(false);
		setEditingStep(null);
	};

	const handleCancelStepEdit = () => {
		setIsAddingStep(false);
		setEditingStep(null);
	};

	const handleMoveStep = (index, direction) => {
		if (
			(direction === "up" && index === 0) ||
			(direction === "down" && index === steps.length - 1)
		) {
			return;
		}

		const newSteps = [...steps];
		const newIndex = direction === "up" ? index - 1 : index + 1;

		// Échanger les positions
		[newSteps[index], newSteps[newIndex]] = [
			newSteps[newIndex],
			newSteps[index],
		];

		onChange(newSteps);
	};

	// Fonctions pour le drag and drop
	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e, index) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e, dropIndex) => {
		e.preventDefault();

		if (draggedIndex === null || draggedIndex === dropIndex) {
			return;
		}

		const newSteps = [...steps];
		const draggedStep = newSteps[draggedIndex];

		// Supprimer l'élément de sa position d'origine
		newSteps.splice(draggedIndex, 1);

		// Insérer l'élément à sa nouvelle position
		newSteps.splice(dropIndex, 0, draggedStep);

		onChange(newSteps);
		setDraggedIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	// Rendu de la liste ou du formulaire
	if (isAddingStep) {
		return (
			<StepForm
				step={editingStep}
				onSave={handleSaveStep}
				onCancel={handleCancelStepEdit}
				disabled={disabled}
			/>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">Étapes ({steps.length})</h3>
				<Button onClick={handleAddStep} disabled={disabled}>
					<Plus className="mr-2 h-4 w-4" />
					Ajouter une étape
				</Button>
			</div>

			{steps.length === 0 ? (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Aucune étape n'a encore été ajoutée. Commencez par créer
						une étape en cliquant sur le bouton ci-dessus.
					</AlertDescription>
				</Alert>
			) : (
				<div className="space-y-2">
					{steps.map((step, index) => (
						<Card
							key={step.id || index}
							className={`${
								draggedIndex === index
									? "opacity-50"
									: "opacity-100"
							} transition-opacity border-2 ${
								draggedIndex === index
									? "border-primary"
									: "border-border"
							}`}
							draggable
							onDragStart={(e) => handleDragStart(e, index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDrop={(e) => handleDrop(e, index)}
							onDragEnd={handleDragEnd}
						>
							<CardHeader className="pb-2 flex flex-row items-start justify-between">
								<div className="flex items-start gap-2">
									<div
										className="mt-1 cursor-move"
										title="Glisser pour réordonner"
									>
										<Grip className="h-5 w-5 text-muted-foreground" />
									</div>
									<div>
										<CardTitle className="text-md flex items-center">
											<Badge className="mr-2 bg-primary">
												{index + 1}
											</Badge>
											{step.title}
										</CardTitle>
										<CardDescription>
											{step.instruction}
										</CardDescription>
									</div>
								</div>
								<div className="flex items-center gap-1">
									{index > 0 && (
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												handleMoveStep(index, "up")
											}
											disabled={disabled}
											title="Déplacer vers le haut"
										>
											<ArrowUp className="h-4 w-4" />
										</Button>
									)}

									{index < steps.length - 1 && (
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												handleMoveStep(index, "down")
											}
											disabled={disabled}
											title="Déplacer vers le bas"
										>
											<ArrowDown className="h-4 w-4" />
										</Button>
									)}

									<Button
										size="icon"
										variant="ghost"
										onClick={() =>
											handleEditStep(step, index)
										}
										disabled={disabled}
										title="Modifier"
									>
										<Pencil className="h-4 w-4" />
									</Button>

									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleDeleteStep(index)}
										disabled={disabled}
										title="Supprimer"
										className="text-destructive hover:bg-destructive/10"
									>
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline">
										Événement: {step.validationEvent}
									</Badge>
									<Badge variant="outline">
										Type: {step.validationType || "3d"}
									</Badge>
									{step.hint && (
										<Badge
											variant="outline"
											className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
										>
											Indice disponible
										</Badge>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
