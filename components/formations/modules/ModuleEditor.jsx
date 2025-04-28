// components/formations/modules/ModuleEditor.jsx
"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleGeneralForm from "./ModuleGeneralForm";
import StepsList from "./StepsList";
import QuestionsList from "./QuestionsList";
import ContentPreview from "./ContentPreview";

export default function ModuleEditor({
	module,
	formationId,
	onSave,
	isSaving = false,
}) {
	const [formData, setFormData] = useState({
		...module,
		steps: module.steps || [],
		questions: module.questions || [],
	});
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("general");
	const [changesMade, setChangesMade] = useState(false);

	// Surveiller les changements dans les données du formulaire
	useEffect(() => {
		setChangesMade(true);
	}, [formData]);

	// Mettre à jour le titre de l'onglet en fonction du type de module
	useEffect(() => {
		setActiveTab((prev) => {
			// Si on est sur l'onglet de contenu et que le type change, on change l'onglet actif
			if (prev === "content" && formData.type === "question") {
				return "questions";
			} else if (prev === "questions" && formData.type === "guide") {
				return "steps";
			}
			return prev;
		});
	}, [formData.type]);

	const handleContentTabClick = () => {
		// Diriger vers l'onglet approprié en fonction du type de module
		if (formData.type === "guide") {
			setActiveTab("steps");
		} else {
			setActiveTab("questions");
		}
	};

	const handleChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleStepsChange = (newSteps) => {
		setFormData((prev) => ({
			...prev,
			steps: newSteps,
		}));
	};

	const handleQuestionsChange = (newQuestions) => {
		setFormData((prev) => ({
			...prev,
			questions: newQuestions,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Validation de base
		if (!formData.title || !formData.contentId) {
			setError("Le titre et l'identifiant sont obligatoires");
			setActiveTab("general");
			return;
		}

		// Validation spécifique au type
		if (
			formData.type === "guide" &&
			(!formData.steps || formData.steps.length === 0)
		) {
			setError("Vous devez ajouter au moins une étape au guide");
			setActiveTab("steps");
			return;
		}

		if (
			formData.type === "question" &&
			(!formData.questions || formData.questions.length === 0)
		) {
			setError("Vous devez ajouter au moins une question");
			setActiveTab("questions");
			return;
		}

		// Tout est valide, on peut sauvegarder
		setError(null);
		onSave(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="flex justify-between items-center">
				<h2 className="text-xl font-medium">
					{formData.title || "Nouveau module"}
					<span className="ml-2 text-sm text-muted-foreground">
						(
						{formData.type === "guide"
							? "Guide interactif"
							: "Questionnaire"}
						)
					</span>
				</h2>

				<Button type="submit" disabled={isSaving || !changesMade}>
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

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="general">
						Informations générales
					</TabsTrigger>
					<TabsTrigger
						value="content"
						onClick={handleContentTabClick}
					>
						{formData.type === "guide" ? "Étapes" : "Questions"}
					</TabsTrigger>
					<TabsTrigger value="preview">Aperçu</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-4 py-4">
					<ModuleGeneralForm
						data={formData}
						onChange={handleChange}
						disabled={isSaving}
					/>
				</TabsContent>

				<TabsContent value="steps" className="space-y-4 py-4">
					{formData.type === "guide" ? (
						<StepsList
							steps={formData.steps || []}
							onChange={handleStepsChange}
							disabled={isSaving}
						/>
					) : (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Ce module est configuré comme un questionnaire.
								Veuillez aller à l'onglet "Questions".
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>

				<TabsContent value="questions" className="space-y-4 py-4">
					{formData.type === "question" ? (
						<QuestionsList
							questions={formData.questions || []}
							onChange={handleQuestionsChange}
							disabled={isSaving}
						/>
					) : (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Ce module est configuré comme un guide. Veuillez
								aller à l'onglet "Étapes".
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>

				<TabsContent value="preview" className="space-y-4 py-4">
					<ContentPreview module={formData} />
				</TabsContent>
			</Tabs>
		</form>
	);
}
