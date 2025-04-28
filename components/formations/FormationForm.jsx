// components/formations/FormationForm.jsx
"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Options pour les catégories de formation
const categoryOptions = [
	"Sécurité",
	"Management",
	"Communication",
	"Technique",
	"Médical",
	"Autre",
];

// Options pour les niveaux de difficulté
const difficultyOptions = ["Débutant", "Intermédiaire", "Avancé"];

export default function FormationForm({
	initialData,
	onSubmit,
	isSaving = false,
	isNew = false,
}) {
	const [formData, setFormData] = useState(initialData || {});
	const [errors, setErrors] = useState({});
	const [activeTab, setActiveTab] = useState("general");
	const [objectMappingText, setObjectMappingText] = useState(
		initialData?.objectMapping
			? JSON.stringify(initialData.objectMapping, null, 2)
			: "{}"
	);

	useEffect(() => {
		if (initialData) {
			setFormData(initialData);
			setObjectMappingText(
				initialData.objectMapping
					? JSON.stringify(initialData.objectMapping, null, 2)
					: "{}"
			);
		}
	}, [initialData]);

	const validateForm = () => {
		const newErrors = {};

		if (!formData.formationId || formData.formationId.trim() === "") {
			newErrors.formationId = "L'identifiant est requis";
		}

		if (!formData.name || formData.name.trim() === "") {
			newErrors.name = "Le nom est requis";
		}

		if (!formData.category || formData.category.trim() === "") {
			newErrors.category = "La catégorie est requise";
		}

		if (!formData.difficulty || formData.difficulty.trim() === "") {
			newErrors.difficulty = "La difficulté est requise";
		}

		if (!formData.duration || formData.duration.trim() === "") {
			newErrors.duration = "La durée est requise";
		}

		// Vérifier le format JSON pour objectMapping
		if (objectMappingText) {
			try {
				JSON.parse(objectMappingText);
			} catch (e) {
				newErrors.objectMapping = "Format JSON invalide";
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

	const handleObjectMappingChange = (value) => {
		setObjectMappingText(value);

		// Essayer de parser le JSON
		try {
			const parsed = JSON.parse(value);
			setFormData((prev) => ({
				...prev,
				objectMapping: parsed,
			}));

			// Effacer l'erreur si elle existe
			if (errors.objectMapping) {
				setErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors.objectMapping;
					return newErrors;
				});
			}
		} catch (e) {
			// Ne pas mettre à jour formData.objectMapping s'il y a une erreur de syntaxe
			setErrors((prev) => ({
				...prev,
				objectMapping: "Format JSON invalide",
			}));
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (validateForm()) {
			onSubmit(formData);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList>
					<TabsTrigger value="general">
						Informations générales
					</TabsTrigger>
					<TabsTrigger value="advanced">
						Paramètres avancés
					</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-4 mt-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Informations de base</CardTitle>
								<CardDescription>
									Les informations principales de la formation
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="formationId">
										Identifiant *
										{errors.formationId && (
											<Badge
												variant="destructive"
												className="ml-2"
											>
												{errors.formationId}
											</Badge>
										)}
									</Label>
									<Input
										id="formationId"
										value={formData.formationId || ""}
										onChange={(e) =>
											handleChange(
												"formationId",
												e.target.value
											)
										}
										placeholder="ex: LOTO_Acces_Zone_Robot"
										disabled={
											isSaving || (!isNew && formData.id)
										}
										className={
											errors.formationId
												? "border-red-500"
												: ""
										}
									/>
									<p className="text-xs text-muted-foreground">
										Identifiant unique utilisé dans le JSON
										d'export
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="name">
										Nom *
										{errors.name && (
											<Badge
												variant="destructive"
												className="ml-2"
											>
												{errors.name}
											</Badge>
										)}
									</Label>
									<Input
										id="name"
										value={formData.name || ""}
										onChange={(e) =>
											handleChange("name", e.target.value)
										}
										placeholder="Nom de la formation"
										disabled={isSaving}
										className={
											errors.name ? "border-red-500" : ""
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">
										Description
									</Label>
									<Textarea
										id="description"
										value={formData.description || ""}
										onChange={(e) =>
											handleChange(
												"description",
												e.target.value
											)
										}
										placeholder="Description de la formation"
										disabled={isSaving}
										rows={4}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Classification</CardTitle>
								<CardDescription>
									Catégorie, difficulté et durée de la
									formation
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="category">
										Catégorie *
										{errors.category && (
											<Badge
												variant="destructive"
												className="ml-2"
											>
												{errors.category}
											</Badge>
										)}
									</Label>
									<Select
										value={formData.category || ""}
										onValueChange={(value) =>
											handleChange("category", value)
										}
										disabled={isSaving}
									>
										<SelectTrigger
											className={
												errors.category
													? "border-red-500"
													: ""
											}
										>
											<SelectValue placeholder="Sélectionnez une catégorie" />
										</SelectTrigger>
										<SelectContent>
											{categoryOptions.map((category) => (
												<SelectItem
													key={category}
													value={category}
												>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="difficulty">
										Difficulté *
										{errors.difficulty && (
											<Badge
												variant="destructive"
												className="ml-2"
											>
												{errors.difficulty}
											</Badge>
										)}
									</Label>
									<Select
										value={formData.difficulty || ""}
										onValueChange={(value) =>
											handleChange("difficulty", value)
										}
										disabled={isSaving}
									>
										<SelectTrigger
											className={
												errors.difficulty
													? "border-red-500"
													: ""
											}
										>
											<SelectValue placeholder="Sélectionnez une difficulté" />
										</SelectTrigger>
										<SelectContent>
											{difficultyOptions.map(
												(difficulty) => (
													<SelectItem
														key={difficulty}
														value={difficulty}
													>
														{difficulty}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="duration">
										Durée *
										{errors.duration && (
											<Badge
												variant="destructive"
												className="ml-2"
											>
												{errors.duration}
											</Badge>
										)}
									</Label>
									<Input
										id="duration"
										value={formData.duration || ""}
										onChange={(e) =>
											handleChange(
												"duration",
												e.target.value
											)
										}
										placeholder="ex: 30 min"
										disabled={isSaving}
										className={
											errors.duration
												? "border-red-500"
												: ""
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="imageUrl">
										URL de l'image
									</Label>
									<Input
										id="imageUrl"
										value={formData.imageUrl || ""}
										onChange={(e) =>
											handleChange(
												"imageUrl",
												e.target.value
											)
										}
										placeholder="ex: /images/formations/securite.jpg"
										disabled={isSaving}
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="advanced" className="space-y-4 mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Paramètres avancés</CardTitle>
							<CardDescription>
								Mapping des objets 3D et identifiant du build
								Unity
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="objectMapping">
									Mapping des objets 3D (JSON)
									{errors.objectMapping && (
										<Badge
											variant="destructive"
											className="ml-2"
										>
											{errors.objectMapping}
										</Badge>
									)}
								</Label>
								<Textarea
									id="objectMapping"
									value={objectMappingText}
									onChange={(e) =>
										handleObjectMappingChange(
											e.target.value
										)
									}
									placeholder='{"objetId": "module-id", ...}'
									disabled={isSaving}
									rows={6}
									className={`font-mono text-sm ${
										errors.objectMapping
											? "border-red-500"
											: ""
									}`}
								/>
								<p className="text-xs text-muted-foreground">
									Mapping entre les ID d'objets 3D et les ID
									de modules
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="buildId">
									ID du Build Unity
								</Label>
								<Input
									id="buildId"
									value={formData.buildId || ""}
									onChange={(e) =>
										handleChange("buildId", e.target.value)
									}
									placeholder="ID du build Unity associé"
									disabled={isSaving}
								/>
								<p className="text-xs text-muted-foreground">
									Identifiant du build Unity WebGL pour cette
									formation
								</p>
							</div>
						</CardContent>
					</Card>

					{!isNew &&
						formData.contents &&
						formData.contents.length > 0 && (
							<Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									Cette formation contient{" "}
									{formData.contents.length} module(s).
									L'éditeur de modules sera implémenté
									prochainement.
								</AlertDescription>
							</Alert>
						)}
				</TabsContent>
			</Tabs>

			<div className="flex justify-end mt-6">
				<Button type="submit" disabled={isSaving}>
					{isSaving ? (
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
			</div>
		</form>
	);
}
