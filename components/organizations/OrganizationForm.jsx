// components/organizations/OrganizationForm.jsx
"use client";

import { useState } from "react";
import { Save, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function OrganizationForm({
	initialData,
	onSubmit,
	isSaving = false,
	isNew = false,
}) {
	const [formData, setFormData] = useState(
		initialData || {
			name: "",
			description: "",
			logoUrl: "",
			azureContainer: "",
			isActive: true,
		}
	);
	const [errors, setErrors] = useState({});

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name || formData.name.trim() === "") {
			newErrors.name = "Le nom est requis";
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
			onSubmit(formData);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Informations de base</CardTitle>
						<CardDescription>
							Les informations principales de l'organisation
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
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
								placeholder="Nom de l'organisation"
								disabled={isSaving}
								className={errors.name ? "border-red-500" : ""}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description || ""}
								onChange={(e) =>
									handleChange("description", e.target.value)
								}
								placeholder="Description de l'organisation"
								disabled={isSaving}
								rows={4}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="logoUrl">URL du logo</Label>
							<Input
								id="logoUrl"
								value={formData.logoUrl || ""}
								onChange={(e) =>
									handleChange("logoUrl", e.target.value)
								}
								placeholder="ex: /images/organizations/logo.jpg"
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="azureContainer">
								Conteneur Azure
							</Label>
							<Input
								id="azureContainer"
								value={formData.azureContainer || ""}
								onChange={(e) =>
									handleChange(
										"azureContainer",
										e.target.value
									)
								}
								placeholder="ex: org-container-name"
								disabled={isSaving}
							/>
							<p className="text-xs text-muted-foreground">
								Nom du conteneur Azure pour stocker les builds
								spécifiques à cette organisation
							</p>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="isActive"
								checked={formData.isActive}
								onCheckedChange={(checked) =>
									handleChange("isActive", checked)
								}
								disabled={isSaving}
							/>
							<Label
								htmlFor="isActive"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Organisation active
							</Label>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end">
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
			</div>
		</form>
	);
}
