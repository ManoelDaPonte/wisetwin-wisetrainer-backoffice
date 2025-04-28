// components/formations/FormationContentsList.jsx
import { useState } from "react";
import {
	FileText,
	ChevronDown,
	ChevronUp,
	ListChecks,
	HelpCircle,
	Footprints,
	BookOpen,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FormationContentsList({ contents = [] }) {
	const [expandedModules, setExpandedModules] = useState({});

	// Fonction pour basculer l'état d'expansion d'un module
	const toggleModule = (id) => {
		setExpandedModules((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	if (!contents || contents.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Modules</CardTitle>
					<CardDescription>
						Aucun module n'a été défini pour cette formation
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">
				Modules ({contents.length})
			</h2>
			<div className="space-y-4">
				{contents.map((content) => (
					<Card key={content.id} className="overflow-hidden">
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{content.type === "guide" ? (
										<Footprints className="h-5 w-5 text-primary" />
									) : (
										<HelpCircle className="h-5 w-5 text-amber-500" />
									)}
									<CardTitle className="text-lg">
										{content.title}
									</CardTitle>
								</div>
								<Badge variant="outline">
									{content.type === "guide"
										? "Guide interactif"
										: "Questionnaire"}
								</Badge>
							</div>
							<CardDescription>
								{content.description}
							</CardDescription>
						</CardHeader>
						<CardContent className="pb-4">
							<Button
								variant="ghost"
								className="w-full justify-between border-t pt-2"
								onClick={() => toggleModule(content.id)}
							>
								<span>
									{expandedModules[content.id]
										? "Masquer les détails"
										: "Afficher les détails"}
								</span>
								{expandedModules[content.id] ? (
									<ChevronUp className="h-4 w-4" />
								) : (
									<ChevronDown className="h-4 w-4" />
								)}
							</Button>

							{expandedModules[content.id] && (
								<div className="mt-4 space-y-4">
									{/* Informations éducatives si disponible */}
									{content.educationalTitle && (
										<div>
											<h4 className="font-medium mb-2 flex items-center">
												<BookOpen className="h-4 w-4 mr-2 text-blue-500" />
												Contenu éducatif
											</h4>
											<div className="border rounded-md p-3 space-y-2">
												<p className="font-medium">
													{content.educationalTitle}
												</p>
												{content.educationalText && (
													<div className="text-sm text-muted-foreground">
														{/* Afficher un aperçu du contenu JSON stocké */}
														<div className="text-xs overflow-hidden text-ellipsis max-h-24">
															{content.educationalText &&
															typeof content.educationalText ===
																"string"
																? content.educationalText.substring(
																		0,
																		200
																  ) + "..."
																: "Contenu structuré disponible"}
														</div>
													</div>
												)}
												{content.imageUrl && (
													<div className="mt-2">
														<span className="text-sm font-medium">
															Image:
														</span>
														<div className="text-sm truncate text-muted-foreground">
															{content.imageUrl}
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Afficher les étapes si c'est un guide */}
									{content.type === "guide" &&
										content.steps &&
										content.steps.length > 0 && (
											<div>
												<h4 className="font-medium mb-2 flex items-center">
													<Footprints className="h-4 w-4 mr-2 text-primary" />
													Séquence d'étapes (
													{content.steps.length})
												</h4>
												<div className="border rounded-md divide-y">
													{content.steps.map(
														(step, index) => (
															<div
																key={step.id}
																className="p-3"
															>
																<div className="flex justify-between items-start">
																	<div className="flex items-center gap-2">
																		<Badge
																			variant="outline"
																			className="h-6 w-6 rounded-full flex items-center justify-center p-0"
																		>
																			{index +
																				1}
																		</Badge>
																		<h5 className="font-medium">
																			{
																				step.title
																			}
																		</h5>
																	</div>
																	<Badge
																		variant="outline"
																		className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
																	>
																		{
																			step.validationType
																		}
																	</Badge>
																</div>
																<p className="mt-1 text-sm">
																	{
																		step.instruction
																	}
																</p>
																<div className="mt-2 text-xs text-muted-foreground">
																	<span className="font-medium">
																		Événement:
																	</span>{" "}
																	{
																		step.validationEvent
																	}
																	{step.hint && (
																		<div className="mt-1">
																			<span className="font-medium">
																				Indice:
																			</span>{" "}
																			{
																				step.hint
																			}
																		</div>
																	)}
																</div>
															</div>
														)
													)}
												</div>
											</div>
										)}

									{/* Afficher les questions si c'est un questionnaire */}
									{content.questions &&
										content.questions.length > 0 && (
											<div>
												<h4 className="font-medium mb-2 flex items-center">
													<ListChecks className="h-4 w-4 mr-2 text-amber-500" />
													Questions (
													{content.questions.length})
												</h4>
												<div className="space-y-4">
													{content.questions.map(
														(question, qIndex) => (
															<div
																key={
																	question.id
																}
																className="border rounded-md p-3"
															>
																<div className="flex justify-between items-start">
																	<h5 className="font-medium flex items-center gap-2">
																		<Badge
																			variant="outline"
																			className="h-6 w-6 rounded-full flex items-center justify-center p-0"
																		>
																			Q
																			{qIndex +
																				1}
																		</Badge>
																		{
																			question.text
																		}
																	</h5>
																	<Badge>
																		{question.type ===
																		"SINGLE"
																			? "Choix unique"
																			: "Choix multiple"}
																	</Badge>
																</div>

																{question.image && (
																	<div className="mt-2 text-xs text-muted-foreground">
																		<span className="font-medium">
																			Image:
																		</span>{" "}
																		{
																			question.image
																		}
																	</div>
																)}

																{question.options &&
																	question
																		.options
																		.length >
																		0 && (
																		<div className="mt-3">
																			<span className="text-sm font-medium">
																				Options:
																			</span>
																			<div className="mt-1 space-y-1">
																				{question.options.map(
																					(
																						option
																					) => (
																						<div
																							key={
																								option.id
																							}
																							className={`flex items-center gap-2 text-sm p-1 rounded ${
																								option.isCorrect
																									? "bg-green-50 dark:bg-green-900/20"
																									: ""
																							}`}
																						>
																							<span
																								className={`size-3 rounded-full ${
																									option.isCorrect
																										? "bg-green-500"
																										: "bg-gray-200 dark:bg-gray-700"
																								}`}
																							/>
																							<span>
																								{
																									option.text
																								}
																							</span>
																							{option.isCorrect && (
																								<Badge
																									variant="outline"
																									className="ml-auto text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
																								>
																									Correcte
																								</Badge>
																							)}
																						</div>
																					)
																				)}
																			</div>
																		</div>
																	)}
															</div>
														)
													)}
												</div>
											</div>
										)}
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
