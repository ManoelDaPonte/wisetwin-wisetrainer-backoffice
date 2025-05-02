//components/formations/FormationForm.jsx
"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, Building } from "lucide-react";
import {
	FORMATION_CATEGORIES,
	FORMATION_DIFFICULTY_LEVELS,
	FORMATION_DURATIONS,
} from "@/lib/config/formations";
import { useOrganizations } from "@/lib/hooks/organizations/useOrganizations";

export default function FormationForm({
	initialData = {
		name: "",
		externalId: "",
		description: "",
		imageUrl: "", // S'assurer que c'est une chaîne vide et non null
		category: "Sécurité",
		difficulty: "Intermédiaire",
		duration: "30 min",
		isPublic: false,
		organizationId: null,
	},
	onSubmit,
	isSaving = false,
	isNew = false,
}) {
	// Préparer les données initiales en s'assurant que les valeurs ne sont pas null
	const preparedInitialData = {
		...initialData,
		name: initialData.name || "",
		externalId: initialData.externalId || "",
		description: initialData.description || "",
		imageUrl: initialData.imageUrl || "", // Convertir null en chaîne vide
		category: initialData.category || "Sécurité",
		difficulty: initialData.difficulty || "Intermédiaire",
		duration: initialData.duration || "30 min",
		isPublic:
			initialData.isPublic === undefined ? false : initialData.isPublic,
		organizationId: initialData.organizationId || null,
	};

	const [formData, setFormData] = useState(preparedInitialData);
	const { organizations, isLoading: isLoadingOrgs } = useOrganizations();

	// S'assurer que les données du formulaire sont mises à jour si initialData change
	useEffect(() => {
		setFormData({
			...initialData,
			name: initialData.name || "",
			externalId: initialData.externalId || "",
			description: initialData.description || "",
			imageUrl: initialData.imageUrl || "", // Convertir null en chaîne vide
			category: initialData.category || "Sécurité",
			difficulty: initialData.difficulty || "Intermédiaire",
			duration: initialData.duration || "30 min",
			isPublic:
				initialData.isPublic === undefined
					? false
					: initialData.isPublic,
			organizationId: initialData.organizationId || null,
		});
	}, [initialData]);

	const handleChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Informations générales</CardTitle>
						<CardDescription>
							Informations de base de la formation
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">
									Nom de la formation
								</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										handleChange("name", e.target.value)
									}
									required
									placeholder="ex: Formation sécurité incendie"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="externalId">
									Identifiant externe
								</Label>
								<Input
									id="externalId"
									value={formData.externalId}
									onChange={(e) =>
										handleChange(
											"externalId",
											e.target.value
										)
									}
									required
									placeholder="ex: SECU_INCENDIE_2023"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									handleChange("description", e.target.value)
								}
								required
								placeholder="Décrivez le contenu et les objectifs de cette formation..."
								rows={4}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="imageUrl">
								URL de l'image (optionnelle)
							</Label>
							<Input
								id="imageUrl"
								value={formData.imageUrl}
								onChange={(e) =>
									handleChange("imageUrl", e.target.value)
								}
								placeholder="https://exemple.com/image.jpg"
							/>
						</div>

						{/* Sélecteur d'organisation */}
						<div className="space-y-2">
							<Label htmlFor="organization">
								Organisation (optionnelle)
							</Label>
							<Select
								value={formData.organizationId || "none"}
								onValueChange={(value) => {
									const orgId =
										value === "none" ? null : value;
									handleChange("organizationId", orgId);

									// Si une organisation est sélectionnée, définir la formation comme privée
									if (orgId) {
										handleChange("isPublic", false);
									}
								}}
							>
								<SelectTrigger id="organization">
									<SelectValue placeholder="Sélectionner une organisation (facultatif)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">
										Aucune organisation
									</SelectItem>
									{isLoadingOrgs ? (
										<SelectItem value="loading" disabled>
											Chargement des organisations...
										</SelectItem>
									) : organizations.length === 0 ? (
										<SelectItem value="empty" disabled>
											Aucune organisation disponible
										</SelectItem>
									) : (
										organizations.map((org) => (
											<SelectItem
												key={org.id}
												value={org.id}
											>
												<div className="flex items-center">
													<Building className="mr-2 h-4 w-4" />
													{org.name}
												</div>
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground mt-1">
								Vous pourrez associer cette formation à une
								organisation ultérieurement si nécessaire.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Classification</CardTitle>
						<CardDescription>
							Catégorisation et paramètres de la formation
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="category">Catégorie</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										handleChange("category", value)
									}
								>
									<SelectTrigger id="category">
										<SelectValue placeholder="Sélectionner une catégorie" />
									</SelectTrigger>
									<SelectContent>
										{FORMATION_CATEGORIES.map(
											(category) => (
												<SelectItem
													key={category}
													value={category}
												>
													{category}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="difficulty">
									Niveau de difficulté
								</Label>
								<Select
									value={formData.difficulty}
									onValueChange={(value) =>
										handleChange("difficulty", value)
									}
								>
									<SelectTrigger id="difficulty">
										<SelectValue placeholder="Sélectionner un niveau" />
									</SelectTrigger>
									<SelectContent>
										{FORMATION_DIFFICULTY_LEVELS.map(
											(level) => (
												<SelectItem
													key={level}
													value={level}
												>
													{level}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="duration">Durée estimée</Label>
								<Select
									value={formData.duration}
									onValueChange={(value) =>
										handleChange("duration", value)
									}
								>
									<SelectTrigger id="duration">
										<SelectValue placeholder="Sélectionner une durée" />
									</SelectTrigger>
									<SelectContent>
										{FORMATION_DURATIONS.map((duration) => (
											<SelectItem
												key={duration}
												value={duration}
											>
												{duration}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex items-center space-x-2 pt-4">
							<Switch
								id="isPublic"
								checked={formData.isPublic}
								onCheckedChange={(checked) =>
									handleChange("isPublic", checked)
								}
								disabled={!!formData.organizationId}
							/>
							<Label
								htmlFor="isPublic"
								className={
									formData.organizationId
										? "text-muted-foreground"
										: ""
								}
							>
								Formation publique (accessible à tous les
								utilisateurs)
								{formData.organizationId && (
									<span className="block text-xs italic mt-1">
										Les formations associées à une
										organisation sont automatiquement
										privées
									</span>
								)}
							</Label>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="submit" disabled={isSaving}>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Enregistrement...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									{isNew
										? "Créer la formation"
										: "Enregistrer"}
								</>
							)}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</form>
	);
}
