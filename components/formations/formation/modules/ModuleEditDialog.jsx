// components/formations/ModuleEditDialog.jsx
"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, AlertCircle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ModuleEditDialog({
	isOpen,
	onClose,
	onSave,
	module = null,
	formationId,
	isLoading = false,
}) {
	const [formData, setFormData] = useState({
		contentId: "", // ID externe du module
		title: "", // Titre du module
		description: "", // Description du module
		type: "guide", // Type du module (guide ou question)
		order: 1, // Ordre d'affichage
		educationalTitle: "", // Titre du contenu éducatif
		educationalText: "", // Contenu éducatif (format JSON)
		imageUrl: "", // URL de l'image
	});

	const [errors, setErrors] = useState({});

	// Initialiser le formulaire avec les données du module existant
	useEffect(() => {
		if (module) {
			setFormData({
				contentId: module.contentId || "",
				title: module.title || "",
				description: module.description || "",
				type: module.type || "guide",
				order: module.order || 1,
				educationalTitle: module.educationalTitle || "",
				educationalText: module.educationalText || "",
				imageUrl: module.imageUrl || "",
			});
		} else {
			// Pour un nouveau module, réinitialiser le formulaire
			setFormData({
				contentId: "",
				title: "",
				description: "",
				type: "guide",
				order: 1,
				educationalTitle: "",
				educationalText: "",
				imageUrl: "",
			});
		}

		// Réinitialiser les erreurs
		setErrors({});
	}, [module, isOpen]);

	const validateForm = () => {
		const newErrors = {};

		if (!formData.contentId.trim()) {
			newErrors.contentId = "L'identifiant du module est requis";
		}

		if (!formData.title.trim()) {
			newErrors.title = "Le titre du module est requis";
		}

		if (!formData.type) {
			newErrors.type = "Le type du module est requis";
		}

		if (!formData.order || formData.order < 1) {
			newErrors.order = "L'ordre doit être un nombre positif";
		}

		// Valider que educationalText est un JSON valide s'il est fourni
		if (formData.educationalText && formData.educationalText.trim()) {
			try {
				JSON.parse(formData.educationalText);
			} catch (e) {
				newErrors.educationalText =
					"Le contenu éducatif doit être un JSON valide";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

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

		if (validateForm()) {
			// Préparer les données pour l'enregistrement
			// Convertir certains champs au format attendu par l'API
			const moduleData = {
				...formData,
				order: parseInt(formData.order, 10),
			};

			onSave(moduleData);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{module ? "Modifier le module" : "Ajouter un module"}
					</DialogTitle>
					<DialogDescription>
						{module
							? "Modifier les informations du module existant"
							: "Créer un nouveau module pour cette formation"}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-2">
						{Object.keys(errors).length > 0 && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Veuillez corriger les erreurs suivantes :
									<ul className="list-disc list-inside mt-2">
										{Object.values(errors).map(
											(error, index) => (
												<li key={index}>{error}</li>
											)
										)}
									</ul>
								</AlertDescription>
							</Alert>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="contentId">
									Identifiant *
									{errors.contentId && (
										<Badge
											variant="destructive"
											className="ml-2"
										>
											Requis
										</Badge>
									)}
								</Label>
								<Input
									id="contentId"
									value={formData.contentId}
									onChange={(e) =>
										handleChange(
											"contentId",
											e.target.value
										)
									}
									placeholder="ex: pressure-risk"
									disabled={
										isLoading || (module && module.id)
									}
									className={
										errors.contentId ? "border-red-500" : ""
									}
								/>
								<p className="text-xs text-muted-foreground">
									Identifiant unique utilisé dans le JSON
									d'export
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="order">
									Ordre *
									{errors.order && (
										<Badge
											variant="destructive"
											className="ml-2"
										>
											Invalide
										</Badge>
									)}
								</Label>
								<Input
									id="order"
									type="number"
									min="1"
									value={formData.order}
									onChange={(e) =>
										handleChange("order", e.target.value)
									}
									placeholder="1"
									disabled={isLoading}
									className={
										errors.order ? "border-red-500" : ""
									}
								/>
								<p className="text-xs text-muted-foreground">
									Position du module dans la formation
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="title">
								Titre *
								{errors.title && (
									<Badge
										variant="destructive"
										className="ml-2"
									>
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
								placeholder="Titre du module"
								disabled={isLoading}
								className={errors.title ? "border-red-500" : ""}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									handleChange("description", e.target.value)
								}
								placeholder="Description du module"
								disabled={isLoading}
								rows={2}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="type">
								Type de module *
								{errors.type && (
									<Badge
										variant="destructive"
										className="ml-2"
									>
										Requis
									</Badge>
								)}
							</Label>
							<Select
								value={formData.type}
								onValueChange={(value) =>
									handleChange("type", value)
								}
								disabled={isLoading}
							>
								<SelectTrigger
									className={
										errors.type ? "border-red-500" : ""
									}
								>
									<SelectValue placeholder="Sélectionnez un type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="guide">
										Guide interactif
									</SelectItem>
									<SelectItem value="question">
										Questionnaire
									</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								Le type détermine la structure et l'interaction
								du module
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="imageUrl">URL de l'image</Label>
							<Input
								id="imageUrl"
								value={formData.imageUrl}
								onChange={(e) =>
									handleChange("imageUrl", e.target.value)
								}
								placeholder="ex: /images/module.jpg"
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="educationalTitle">
								Titre du contenu éducatif
							</Label>
							<Input
								id="educationalTitle"
								value={formData.educationalTitle}
								onChange={(e) =>
									handleChange(
										"educationalTitle",
										e.target.value
									)
								}
								placeholder="Titre de la section éducative"
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="educationalText">
								Contenu éducatif (JSON)
								{errors.educationalText && (
									<Badge
										variant="destructive"
										className="ml-2"
									>
										JSON invalide
									</Badge>
								)}
							</Label>
							<Textarea
								id="educationalText"
								value={formData.educationalText}
								onChange={(e) =>
									handleChange(
										"educationalText",
										e.target.value
									)
								}
								placeholder=""
								disabled={isLoading}
								rows={4}
								className={`font-mono text-sm ${
									errors.educationalText
										? "border-red-500"
										: ""
								}`}
							/>
							<p className="text-xs text-muted-foreground">
								Contenu structuré au format JSON pour la partie
								éducative
							</p>
						</div>
					</div>

					<DialogFooter className="mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Enregistrement...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Enregistrer
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
