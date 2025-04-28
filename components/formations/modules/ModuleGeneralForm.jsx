// components/formations/modules/ModuleGeneralForm.jsx
"use client";

import { Badge } from "@/components/ui/badge";
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
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export default function ModuleGeneralForm({
	data,
	onChange,
	disabled = false,
}) {
	const [educationalExpanded, setEducationalExpanded] = useState(false);

	const handleChange = (field) => (e) => {
		onChange(field, e.target.value);
	};

	const handleSelectChange = (field) => (value) => {
		onChange(field, value);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Informations de base</CardTitle>
					<CardDescription>
						Informations principales du module
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="contentId">
								Identifiant
								{!data.contentId && (
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
								value={data.contentId || ""}
								onChange={handleChange("contentId")}
								placeholder="ex: pressure-risk"
								disabled={disabled}
							/>
							<p className="text-xs text-muted-foreground">
								Identifiant unique utilisé dans le JSON d'export
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="type">Type de module</Label>
							<Select
								value={data.type || "guide"}
								onValueChange={handleSelectChange("type")}
								disabled={disabled}
							>
								<SelectTrigger id="type">
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
					</div>

					<div className="space-y-2">
						<Label htmlFor="title">
							Titre
							{!data.title && (
								<Badge variant="destructive" className="ml-2">
									Requis
								</Badge>
							)}
						</Label>
						<Input
							id="title"
							value={data.title || ""}
							onChange={handleChange("title")}
							placeholder="Titre du module"
							disabled={disabled}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={data.description || ""}
							onChange={handleChange("description")}
							placeholder="Description du module"
							disabled={disabled}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="order">Ordre</Label>
						<Input
							id="order"
							type="number"
							min="1"
							value={data.order || 1}
							onChange={handleChange("order")}
							disabled={disabled}
						/>
						<p className="text-xs text-muted-foreground">
							Position du module dans la formation
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Contenu éducatif</CardTitle>
					<CardDescription>
						Informations pédagogiques affichées à l'utilisateur
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="imageUrl">URL de l'image</Label>
						<Input
							id="imageUrl"
							value={data.imageUrl || ""}
							onChange={handleChange("imageUrl")}
							placeholder="ex: /images/formations/module.jpg"
							disabled={disabled}
						/>
						<p className="text-xs text-muted-foreground">
							Image illustrant le contenu du module
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="educationalTitle">
							Titre du contenu éducatif
						</Label>
						<Input
							id="educationalTitle"
							value={data.educationalTitle || ""}
							onChange={handleChange("educationalTitle")}
							placeholder="ex: Comprendre les risques de pression"
							disabled={disabled}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label htmlFor="educationalText">
								Contenu éducatif (JSON)
							</Label>
							<button
								type="button"
								className="text-xs text-blue-500 hover:underline"
								onClick={() =>
									setEducationalExpanded(!educationalExpanded)
								}
							>
								{educationalExpanded ? "Réduire" : "Agrandir"}
							</button>
						</div>
						<Textarea
							id="educationalText"
							value={data.educationalText || ""}
							onChange={handleChange("educationalText")}
							placeholder={""}
							disabled={disabled}
							rows={educationalExpanded ? 12 : 5}
							className="font-mono text-sm"
						/>
						<p className="text-xs text-muted-foreground">
							Contenu structuré au format JSON pour la partie
							éducative
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
