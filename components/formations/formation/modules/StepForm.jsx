// components/formations/modules/StepForm.jsx
"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Types de validation disponibles
const validationTypes = [
	{ value: "3d", label: "Interaction 3D" },
	{ value: "click", label: "Clic sur élément" },
	{ value: "input", label: "Saisie utilisateur" },
	{ value: "animation", label: "Animation" },
	{ value: "custom", label: "Personnalisé" },
];

export default function StepForm({
	step = null,
	onSave,
	onCancel,
	disabled = false,
}) {
	const [formData, setFormData] = useState({
		stepId: "",
		title: "",
		instruction: "",
		validationEvent: "",
		validationType: "3d",
		hint: "",
	});
	const [errors, setErrors] = useState({});

	// Initialiser le formulaire avec les données de l'étape existante
	useEffect(() => {
		if (step) {
			setFormData({
				stepId: step.stepId || "",
				title: step.title || "",
				instruction: step.instruction || "",
				validationEvent: step.validationEvent || "",
				validationType: step.validationType || "3d",
				hint: step.hint || "",
			});
		}
	}, [step]);

	const handleChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Effacer l'erreur pour ce champ si elle existe
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Validation
		const newErrors = {};

		if (!formData.stepId) {
			newErrors.stepId = "L'identifiant de l'étape est requis";
		}

		if (!formData.title) {
			newErrors.title = "Le titre de l'étape est requis";
		}

		if (!formData.instruction) {
			newErrors.instruction = "L'instruction est requise";
		}

		if (!formData.validationEvent) {
			newErrors.validationEvent = "L'événement de validation est requis";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Tout est valide, on sauvegarde
		onSave(formData);
	};

	return (
		<Card>
			<form onSubmit={handleSubmit}>
				<CardHeader>
					<CardTitle>
						{step ? "Modifier l'étape" : "Ajouter une étape"}
					</CardTitle>
					<CardDescription>
						{step
							? "Modifier les informations de l'étape existante"
							: "Ajouter une nouvelle étape à la séquence"}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{Object.keys(errors).length > 0 && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<div>
									Veuillez corriger les erreurs suivantes :
								</div>
								<ul className="list-disc list-inside mt-1">
									{Object.values(errors).map(
										(error, index) => (
											<li key={index}>{error}</li>
										)
									)}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="stepId">
								Identifiant
								{errors.stepId && (
									<Badge
										variant="destructive"
										className="ml-2"
									>
										Requis
									</Badge>
								)}
							</Label>
							<Input
								id="stepId"
								value={formData.stepId}
								onChange={(e) =>
									handleChange("stepId", e.target.value)
								}
								placeholder="ex: step-1"
								disabled={disabled}
								className={
									errors.stepId ? "border-red-500" : ""
								}
							/>
							<p className="text-xs text-muted-foreground">
								Identifiant unique pour cette étape
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="validationType">
								Type de validation
							</Label>
							<Select
								value={formData.validationType}
								onValueChange={(value) =>
									handleChange("validationType", value)
								}
								disabled={disabled}
							>
								<SelectTrigger id="validationType">
									<SelectValue placeholder="Sélectionnez un type" />
								</SelectTrigger>
								<SelectContent>
									{validationTypes.map((type) => (
										<SelectItem
											key={type.value}
											value={type.value}
										>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								Type d'interaction attendu pour valider l'étape
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="title">
							Titre
							{errors.title && (
								<Badge variant="destructive" className="ml-2">
									Requis
								</Badge>
							)}
						</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) =>
								handleChange("title", e.target.value)
							}
							placeholder="ex: Commutateur en manuel"
							disabled={disabled}
							className={errors.title ? "border-red-500" : ""}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="instruction">
							Instruction
							{errors.instruction && (
								<Badge variant="destructive" className="ml-2">
									Requis
								</Badge>
							)}
						</Label>
						<Textarea
							id="instruction"
							value={formData.instruction}
							onChange={(e) =>
								handleChange("instruction", e.target.value)
							}
							placeholder="ex: Je mets le commutateur en manuel"
							disabled={disabled}
							rows={3}
							className={
								errors.instruction ? "border-red-500" : ""
							}
						/>
						<p className="text-xs text-muted-foreground">
							Texte explicatif affiché à l'utilisateur
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="validationEvent">
							Événement de validation
							{errors.validationEvent && (
								<Badge variant="destructive" className="ml-2">
									Requis
								</Badge>
							)}
						</Label>
						<Input
							id="validationEvent"
							value={formData.validationEvent}
							onChange={(e) =>
								handleChange("validationEvent", e.target.value)
							}
							placeholder="ex: commutateur"
							disabled={disabled}
							className={
								errors.validationEvent ? "border-red-500" : ""
							}
						/>
						<p className="text-xs text-muted-foreground">
							Nom de l'événement qui validera cette étape dans
							l'environnement 3D
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="hint">Indice (optionnel)</Label>
						<Textarea
							id="hint"
							value={formData.hint}
							onChange={(e) =>
								handleChange("hint", e.target.value)
							}
							placeholder="ex: Touner le button en haut a gauche du panneau de contrôle"
							disabled={disabled}
							rows={2}
						/>
						<p className="text-xs text-muted-foreground">
							Indice affiché à l'utilisateur en cas de difficulté
						</p>
					</div>
				</CardContent>

				<CardFooter className="flex justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={disabled}
					>
						<X className="mr-2 h-4 w-4" />
						Annuler
					</Button>
					<Button type="submit" disabled={disabled}>
						<Save className="mr-2 h-4 w-4" />
						Enregistrer
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
