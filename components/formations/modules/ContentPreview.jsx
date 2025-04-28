// components/formations/modules/ContentPreview.jsx
"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Book, List, Code, ArrowRight } from "lucide-react";

export default function ContentPreview({ module }) {
	const [activeTab, setActiveTab] = useState("rendered");
	const [currentStep, setCurrentStep] = useState(0);

	if (!module) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Aucun module à prévisualiser. Veuillez d'abord créer ou
					charger un module.
				</AlertDescription>
			</Alert>
		);
	}

	// Formatage du contenu éducatif pour l'affichage
	const renderEducationalContent = () => {
		if (!module.educationalText) {
			return (
				<p className="text-muted-foreground italic">
					Aucun contenu éducatif fourni.
				</p>
			);
		}

		try {
			let content;
			try {
				content = JSON.parse(module.educationalText);
			} catch {
				return (
					<div className="border p-4 rounded-md bg-muted/20">
						<p>{module.educationalText}</p>
					</div>
				);
			}

			return (
				<div className="space-y-4">
					{content.intro && (
						<p className="font-medium">{content.intro}</p>
					)}

					{content.sections &&
						content.sections.map((section, index) => (
							<div key={index} className="space-y-2">
								{section.title && (
									<h4 className="font-medium">
										{section.title}
									</h4>
								)}
								{section.text && <p>{section.text}</p>}
								{section.items && (
									<ul className="list-disc list-inside pl-2 space-y-1">
										{section.items.map(
											(item, itemIndex) => (
												<li key={itemIndex}>{item}</li>
											)
										)}
									</ul>
								)}
							</div>
						))}
				</div>
			);
		} catch (error) {
			return (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Erreur lors du rendu du contenu éducatif:{" "}
						{error.message}
					</AlertDescription>
				</Alert>
			);
		}
	};

	// Prévisualisation en mode étapes
	const renderStepsPreview = () => {
		if (!module.steps || module.steps.length === 0) {
			return (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Aucune étape définie pour ce module.
					</AlertDescription>
				</Alert>
			);
		}

		const currentStepData = module.steps[currentStep];

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2 mb-4">
					{module.steps.map((_, index) => (
						<Badge
							key={index}
							className={`size-8 flex items-center justify-center rounded-full cursor-pointer ${
								index === currentStep
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground"
							}`}
							onClick={() => setCurrentStep(index)}
						>
							{index + 1}
						</Badge>
					))}
				</div>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xl flex items-center gap-2">
							<Badge className="bg-primary h-6 w-6 flex items-center justify-center rounded-full">
								{currentStep + 1}
							</Badge>
							{currentStepData.title}
						</CardTitle>
						<CardDescription className="text-base">
							{currentStepData.instruction}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 pt-2">
						<div className="flex gap-2 flex-wrap">
							<Badge variant="outline">
								Type: {currentStepData.validationType || "3d"}
							</Badge>
							<Badge variant="outline">
								Événement: {currentStepData.validationEvent}
							</Badge>
						</div>

						{currentStepData.hint && (
							<div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-md">
								<p className="text-sm font-medium text-amber-800 dark:text-amber-400">
									Indice:
								</p>
								<p className="text-sm text-amber-700 dark:text-amber-300">
									{currentStepData.hint}
								</p>
							</div>
						)}

						<div className="flex justify-between pt-4">
							<Button
								variant="outline"
								onClick={() =>
									setCurrentStep((prev) =>
										Math.max(0, prev - 1)
									)
								}
								disabled={currentStep === 0}
							>
								Précédent
							</Button>
							<Button
								onClick={() =>
									setCurrentStep((prev) =>
										Math.min(
											module.steps.length - 1,
											prev + 1
										)
									)
								}
								disabled={
									currentStep === module.steps.length - 1
								}
							>
								Suivant
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	};

	// Prévisualisation en mode questionnaire
	const renderQuestionsPreview = () => {
		if (!module.questions || module.questions.length === 0) {
			return (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Aucune question définie pour ce module.
					</AlertDescription>
				</Alert>
			);
		}

		const currentQuestionData = module.questions[currentStep];

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2 mb-4">
					{module.questions.map((_, index) => (
						<Badge
							key={index}
							className={`size-8 flex items-center justify-center rounded-full cursor-pointer ${
								index === currentStep
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground"
							}`}
							onClick={() => setCurrentStep(index)}
						>
							{index + 1}
						</Badge>
					))}
				</div>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base flex items-center gap-2">
							<Badge className="bg-primary h-6 w-6 flex items-center justify-center rounded-full">
								Q{currentStep + 1}
							</Badge>
							{currentQuestionData.text}
						</CardTitle>
						<CardDescription>
							<Badge variant="outline">
								{currentQuestionData.type === "SINGLE"
									? "Choix unique"
									: "Choix multiple"}
							</Badge>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 pt-2">
						{currentQuestionData.image && (
							<div className="rounded-md overflow-hidden border">
								<img
									src={currentQuestionData.image}
									alt={`Question ${currentStep + 1}`}
									className="w-full max-h-48 object-cover"
									onError={(e) => {
										e.target.src = "/placeholder.jpg";
										e.target.alt = "Image non disponible";
									}}
								/>
							</div>
						)}

						<div className="space-y-2">
							{currentQuestionData.options?.map(
								(option, index) => (
									<div
										key={index}
										className={`flex items-start gap-2 p-3 rounded-md border ${
											option.isCorrect
												? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
												: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/10"
										}`}
									>
										<div className="flex items-center justify-center size-6 shrink-0 rounded-full bg-muted text-muted-foreground">
											{String.fromCharCode(65 + index)}
										</div>
										<div className="flex-grow">
											<p>{option.text}</p>
										</div>
										{option.isCorrect && (
											<Badge className="bg-green-500 text-white">
												Correcte
											</Badge>
										)}
									</div>
								)
							)}
						</div>

						<div className="flex justify-between pt-4">
							<Button
								variant="outline"
								onClick={() =>
									setCurrentStep((prev) =>
										Math.max(0, prev - 1)
									)
								}
								disabled={currentStep === 0}
							>
								Précédent
							</Button>
							<Button
								onClick={() =>
									setCurrentStep((prev) =>
										Math.min(
											module.questions.length - 1,
											prev + 1
										)
									)
								}
								disabled={
									currentStep === module.questions.length - 1
								}
							>
								Suivant
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	};

	// Affichage du code source JSON
	const renderJsonPreview = () => {
		try {
			const moduleJson = JSON.stringify(module, null, 2);
			return (
				<div className="border rounded-md overflow-hidden">
					<div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
						<div className="text-sm font-medium">JSON</div>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => {
								navigator.clipboard.writeText(moduleJson);
							}}
							className="h-7 text-xs"
						>
							Copier
						</Button>
					</div>
					<pre className="p-4 overflow-auto max-h-96 text-xs font-mono">
						{moduleJson}
					</pre>
				</div>
			);
		} catch (error) {
			return (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Erreur lors de la génération du JSON: {error.message}
					</AlertDescription>
				</Alert>
			);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">Aperçu du module</h3>
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-auto"
				>
					<TabsList>
						<TabsTrigger
							value="rendered"
							className="text-xs px-2 py-1"
						>
							<Book className="h-3 w-3 mr-1" />
							Rendu
						</TabsTrigger>
						<TabsTrigger value="json" className="text-xs px-2 py-1">
							<Code className="h-3 w-3 mr-1" />
							JSON
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div>
				{activeTab === "rendered" ? (
					<div className="space-y-6">
						{module.educationalTitle && (
							<Card>
								<CardHeader>
									<CardTitle>
										{module.educationalTitle}
									</CardTitle>
								</CardHeader>
								<CardContent>
									{renderEducationalContent()}

									{module.imageUrl && (
										<div className="mt-4 rounded-md overflow-hidden border">
											<img
												src={module.imageUrl}
												alt={module.educationalTitle}
												className="w-full max-h-48 object-contain"
												onError={(e) => {
													e.target.src =
														"/placeholder.jpg";
													e.target.alt =
														"Image non disponible";
												}}
											/>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{module.type === "guide"
							? renderStepsPreview()
							: renderQuestionsPreview()}
					</div>
				) : (
					renderJsonPreview()
				)}
			</div>
		</div>
	);
}
