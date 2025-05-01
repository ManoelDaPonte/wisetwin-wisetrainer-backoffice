// components/formations/modules/QuestionForm.jsx
"use client";

import { useState, useEffect } from "react";
import {
	Save,
	X,
	AlertCircle,
	Plus,
	Trash,
	Check,
	Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

// Types de questions disponibles
const questionTypes = [
	{ value: "SINGLE", label: "Choix unique" },
	{ value: "MULTIPLE", label: "Choix multiple" },
];

// Générer un identifiant unique pour une nouvelle option
const generateOptionId = (prefix, index) => {
	return `${prefix}-o${index + 1}`;
};

export default function QuestionForm({
	question = null,
	onSave,
	onCancel,
	disabled = false,
}) {
	const [formData, setFormData] = useState({
		questionId: "",
		text: "",
		type: "SINGLE",
		image: "",
		options: [
			{ optionId: "option-1", text: "", isCorrect: false },
			{ optionId: "option-2", text: "", isCorrect: false },
		],
	});
	const [errors, setErrors] = useState({});

	// Initialiser le formulaire avec les données de la question existante
	useEffect(() => {
		if (question) {
			setFormData({
				questionId: question.questionId || "",
				text: question.text || "",
				type: question.type || "SINGLE",
				image: question.image || "",
				options:
					question.options && question.options.length > 0
						? question.options.map((option) => ({
								optionId: option.optionId || "",
								text: option.text || "",
								isCorrect: option.isCorrect || false,
						  }))
						: [
								{
									optionId: "option-1",
									text: "",
									isCorrect: false,
								},
								{
									optionId: "option-2",
									text: "",
									isCorrect: false,
								},
						  ],
			});
		}
	}, [question]);

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

	const handleOptionChange = (index, field, value) => {
		const newOptions = [...formData.options];
		newOptions[index] = {
			...newOptions[index],
			[field]: value,
		};

		// Pour les questions à choix unique, désélectionner les autres options
		if (
			field === "isCorrect" &&
			value === true &&
			formData.type === "SINGLE"
		) {
			newOptions.forEach((option, i) => {
				if (i !== index) {
					newOptions[i] = {
						...newOptions[i],
						isCorrect: false,
					};
				}
			});
		}

		setFormData((prev) => ({
			...prev,
			options: newOptions,
		}));

		// Effacer les erreurs liées aux options
		if (errors.options || errors[`option-${index}`]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.options;
				delete newErrors[`option-${index}`];
				return newErrors;
			});
		}
	};

	const handleAddOption = () => {
		const newOptions = [...formData.options];
		const prefix = formData.questionId || "option";
		const newOptionId = generateOptionId(prefix, newOptions.length);

		newOptions.push({
			optionId: newOptionId,
			text: "",
			isCorrect: false,
		});

		setFormData((prev) => ({
			...prev,
			options: newOptions,
		}));
	};

	const handleRemoveOption = (index) => {
		if (formData.options.length <= 2) {
			setErrors((prev) => ({
				...prev,
				options: "Une question doit avoir au moins 2 options",
			}));
			return;
		}

		const newOptions = [...formData.options];
		newOptions.splice(index, 1);

		setFormData((prev) => ({
			...prev,
			options: newOptions,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Validation
		const newErrors = {};

		if (!formData.questionId) {
			newErrors.questionId = "L'identifiant de la question est requis";
		}

		if (!formData.text) {
			newErrors.text = "Le texte de la question est requis";
		}

		if (!formData.type) {
			newErrors.type = "Le type de question est requis";
		}

		// Validation des options
		if (formData.options.length < 2) {
			newErrors.options = "Une question doit avoir au moins 2 options";
		}

		let hasCorrectOption = false;
		formData.options.forEach((option, index) => {
			if (!option.text) {
				newErrors[`option-${index}`] = `Le texte de l'option ${
					index + 1
				} est requis`;
			}

			if (option.isCorrect) {
				hasCorrectOption = true;
			}
		});

		if (!hasCorrectOption) {
			newErrors.options =
				"Au moins une option doit être marquée comme correcte";
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
						{question
							? "Modifier la question"
							: "Ajouter une question"}
					</CardTitle>
					<CardDescription>
						{question
							? "Modifier les informations de la question existante"
							: "Ajouter une nouvelle question au module"}
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{Object.keys(errors).length > 0 && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<div>
									Veuillez corriger les erreurs suivantes :
								</div>
								<ul className="list-disc list-inside mt-1">
									{Object.entries(errors).map(
										([key, error], index) => {
											// Ne pas afficher les erreurs spécifiques aux options ici
											if (!key.startsWith("option-")) {
												return (
													<li key={index}>{error}</li>
												);
											}
											return null;
										}
									)}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="questionId">
								Identifiant
								{errors.questionId && (
									<Badge
										variant="destructive"
										className="ml-2"
									>
										Requis
									</Badge>
								)}
							</Label>
							<Input
								id="questionId"
								value={formData.questionId}
								onChange={(e) =>
									handleChange("questionId", e.target.value)
								}
								placeholder="ex: pressure-risk-q1"
								disabled={disabled}
								className={
									errors.questionId ? "border-red-500" : ""
								}
							/>
							<p className="text-xs text-muted-foreground">
								Identifiant unique pour cette question
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="type">Type de question</Label>
							<Select
								value={formData.type}
								onValueChange={(value) =>
									handleChange("type", value)
								}
								disabled={disabled}
							>
								<SelectTrigger id="type">
									<SelectValue placeholder="Sélectionnez un type" />
								</SelectTrigger>
								<SelectContent>
									{questionTypes.map((type) => (
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
								{formData.type === "SINGLE"
									? "L'utilisateur ne pourra choisir qu'une seule réponse"
									: "L'utilisateur pourra sélectionner plusieurs réponses"}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="text">
							Texte de la question
							{errors.text && (
								<Badge variant="destructive" className="ml-2">
									Requis
								</Badge>
							)}
						</Label>
						<Textarea
							id="text"
							value={formData.text}
							onChange={(e) =>
								handleChange("text", e.target.value)
							}
							placeholder="ex: De quel risque principal s'agit-il dans ce scénario ?"
							disabled={disabled}
							rows={3}
							className={errors.text ? "border-red-500" : ""}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="image">Image (URL)</Label>
						<div className="flex gap-2">
							<div className="flex-grow">
								<Input
									id="image"
									value={formData.image}
									onChange={(e) =>
										handleChange("image", e.target.value)
									}
									placeholder="ex: /images/formations/question1.jpg"
									disabled={disabled}
								/>
							</div>
							{formData.image && (
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-9 w-9 shrink-0"
									title="Prévisualiser l'image"
									onClick={() =>
										window.open(formData.image, "_blank")
									}
								>
									<ImageIcon className="h-4 w-4" />
								</Button>
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							URL de l'image illustrant la question (optionnelle)
						</p>
					</div>

					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<Label>
								Options de réponse
								{errors.options && (
									<Badge
										variant="destructive"
										className="ml-2"
									>
										{errors.options}
									</Badge>
								)}
							</Label>
							<Button
								type="button"
								onClick={handleAddOption}
								disabled={disabled}
								size="sm"
							>
								<Plus className="mr-1 h-3 w-3" />
								Ajouter une option
							</Button>
						</div>

						<p className="text-xs text-muted-foreground mt-1">
							{formData.type === "SINGLE"
								? "Marquez une seule option comme correcte"
								: "Plusieurs options peuvent être marquées comme correctes"}
						</p>

						<div className="space-y-3 rounded-md border p-4">
							{formData.options.map((option, index) => (
								<div
									key={index}
									className={`flex items-start gap-2 ${
										index < formData.options.length - 1
											? "border-b pb-3"
											: ""
									}`}
								>
									<div className="mt-2.5">
										<Checkbox
											id={`option-${index}-correct`}
											checked={option.isCorrect}
											onCheckedChange={(checked) =>
												handleOptionChange(
													index,
													"isCorrect",
													checked
												)
											}
											disabled={disabled}
										/>
									</div>
									<div className="flex-grow space-y-2">
										<div className="flex items-center gap-2">
											<Badge className="bg-secondary text-secondary-foreground">
												{String.fromCharCode(
													65 + index
												)}
											</Badge>
											{option.isCorrect && (
												<Badge
													variant="outline"
													className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
												>
													<Check className="mr-1 h-3 w-3" />
													Correcte
												</Badge>
											)}
										</div>
										<div>
											<Input
												id={`option-${index}-text`}
												value={option.text}
												onChange={(e) =>
													handleOptionChange(
														index,
														"text",
														e.target.value
													)
												}
												placeholder={`Texte de l'option ${
													index + 1
												}`}
												disabled={disabled}
												className={
													errors[`option-${index}`]
														? "border-red-500"
														: ""
												}
											/>
											{errors[`option-${index}`] && (
												<p className="text-xs text-red-500 mt-1">
													{errors[`option-${index}`]}
												</p>
											)}
										</div>
										<div className="flex items-center gap-2">
											<Label
												htmlFor={`option-${index}-id`}
												className="text-xs w-20 shrink-0"
											>
												ID:
											</Label>
											<Input
												id={`option-${index}-id`}
												value={option.optionId}
												onChange={(e) =>
													handleOptionChange(
														index,
														"optionId",
														e.target.value
													)
												}
												placeholder={`ID de l'option ${
													index + 1
												}`}
												disabled={disabled}
												className="h-7 text-xs"
											/>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() =>
											handleRemoveOption(index)
										}
										disabled={
											disabled ||
											formData.options.length <= 2
										}
										className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
									>
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
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
