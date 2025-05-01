// components/formations/modules/QuestionsList.jsx
"use client";

import { useState } from "react";
import {
	Plus,
	Pencil,
	Trash,
	ArrowUp,
	ArrowDown,
	Grip,
	AlertCircle,
	CheckCircle,
	XCircle,
	Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import QuestionForm from "./QuestionForm";

export default function QuestionsList({
	questions = [],
	onChange,
	disabled = false,
}) {
	const [editingQuestion, setEditingQuestion] = useState(null);
	const [isAddingQuestion, setIsAddingQuestion] = useState(false);
	const [draggedIndex, setDraggedIndex] = useState(null);
	const [expandedQuestions, setExpandedQuestions] = useState({});

	const handleAddQuestion = () => {
		setEditingQuestion(null);
		setIsAddingQuestion(true);
	};

	const handleEditQuestion = (question, index) => {
		setEditingQuestion({ ...question, index });
		setIsAddingQuestion(true);
	};

	const handleDeleteQuestion = (index) => {
		if (
			!window.confirm(
				"Êtes-vous sûr de vouloir supprimer cette question ?"
			)
		) {
			return;
		}

		const newQuestions = [...questions];
		newQuestions.splice(index, 1);
		onChange(newQuestions);
	};

	const handleSaveQuestion = (questionData) => {
		const newQuestions = [...questions];

		if (editingQuestion !== null) {
			// Mise à jour d'une question existante
			newQuestions[editingQuestion.index] = questionData;
		} else {
			// Ajout d'une nouvelle question
			newQuestions.push(questionData);
		}

		onChange(newQuestions);
		setIsAddingQuestion(false);
		setEditingQuestion(null);
	};

	const handleCancelQuestionEdit = () => {
		setIsAddingQuestion(false);
		setEditingQuestion(null);
	};

	const handleMoveQuestion = (index, direction) => {
		if (
			(direction === "up" && index === 0) ||
			(direction === "down" && index === questions.length - 1)
		) {
			return;
		}

		const newQuestions = [...questions];
		const newIndex = direction === "up" ? index - 1 : index + 1;

		// Échanger les positions
		[newQuestions[index], newQuestions[newIndex]] = [
			newQuestions[newIndex],
			newQuestions[index],
		];

		onChange(newQuestions);
	};

	// Fonctions pour le drag and drop
	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e, index) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e, dropIndex) => {
		e.preventDefault();

		if (draggedIndex === null || draggedIndex === dropIndex) {
			return;
		}

		const newQuestions = [...questions];
		const draggedQuestion = newQuestions[draggedIndex];

		// Supprimer l'élément de sa position d'origine
		newQuestions.splice(draggedIndex, 1);

		// Insérer l'élément à sa nouvelle position
		newQuestions.splice(dropIndex, 0, draggedQuestion);

		onChange(newQuestions);
		setDraggedIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	const toggleQuestionExpansion = (index) => {
		setExpandedQuestions((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	// Rendu de la liste ou du formulaire
	if (isAddingQuestion) {
		return (
			<QuestionForm
				question={editingQuestion}
				onSave={handleSaveQuestion}
				onCancel={handleCancelQuestionEdit}
				disabled={disabled}
			/>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">
					Questions ({questions.length})
				</h3>
				<Button onClick={handleAddQuestion} disabled={disabled}>
					<Plus className="mr-2 h-4 w-4" />
					Ajouter une question
				</Button>
			</div>

			{questions.length === 0 ? (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Aucune question n'a encore été ajoutée. Commencez par
						créer une question en cliquant sur le bouton ci-dessus.
					</AlertDescription>
				</Alert>
			) : (
				<div className="space-y-3">
					{questions.map((question, index) => (
						<Card
							key={question.id || index}
							className={`${
								draggedIndex === index
									? "opacity-50"
									: "opacity-100"
							} transition-opacity border-2 ${
								draggedIndex === index
									? "border-primary"
									: "border-border"
							}`}
							draggable
							onDragStart={(e) => handleDragStart(e, index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDrop={(e) => handleDrop(e, index)}
							onDragEnd={handleDragEnd}
						>
							<CardHeader className="pb-2 flex flex-row items-start justify-between">
								<div className="flex items-start gap-2">
									<div
										className="mt-1 cursor-move"
										title="Glisser pour réordonner"
									>
										<Grip className="h-5 w-5 text-muted-foreground" />
									</div>
									<div>
										<CardTitle className="text-md flex items-center">
											<Badge className="mr-2 bg-primary">
												Q{index + 1}
											</Badge>
											{question.text}
										</CardTitle>
										<CardDescription className="flex items-center gap-2 mt-1">
											<Badge variant="outline">
												{question.type === "SINGLE"
													? "Choix unique"
													: "Choix multiple"}
											</Badge>
											{question.image && (
												<Badge
													variant="outline"
													className="flex items-center gap-1"
												>
													<ImageIcon className="h-3 w-3" />
													Image
												</Badge>
											)}
											<Badge variant="outline">
												{question.options?.length || 0}{" "}
												options
											</Badge>
										</CardDescription>
									</div>
								</div>
								<div className="flex items-center gap-1">
									{index > 0 && (
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												handleMoveQuestion(index, "up")
											}
											disabled={disabled}
											title="Déplacer vers le haut"
										>
											<ArrowUp className="h-4 w-4" />
										</Button>
									)}

									{index < questions.length - 1 && (
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												handleMoveQuestion(
													index,
													"down"
												)
											}
											disabled={disabled}
											title="Déplacer vers le bas"
										>
											<ArrowDown className="h-4 w-4" />
										</Button>
									)}

									<Button
										size="icon"
										variant="ghost"
										onClick={() =>
											handleEditQuestion(question, index)
										}
										disabled={disabled}
										title="Modifier"
									>
										<Pencil className="h-4 w-4" />
									</Button>

									<Button
										size="icon"
										variant="ghost"
										onClick={() =>
											handleDeleteQuestion(index)
										}
										disabled={disabled}
										title="Supprimer"
										className="text-destructive hover:bg-destructive/10"
									>
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>

							{question.options &&
								question.options.length > 0 && (
									<CardContent className="pb-0">
										<Button
											variant="ghost"
											onClick={() =>
												toggleQuestionExpansion(index)
											}
											className="w-full justify-between text-sm"
										>
											<span>
												{expandedQuestions[index]
													? "Masquer les options"
													: "Afficher les options"}
											</span>
											{expandedQuestions[index] ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)}
										</Button>

										{expandedQuestions[index] && (
											<div className="mt-2 space-y-1">
												{question.options.map(
													(option, optIndex) => (
														<div
															key={
																option.id ||
																optIndex
															}
															className={`flex items-center gap-2 text-sm p-2 rounded-md ${
																option.isCorrect
																	? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50"
																	: "bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900/50"
															}`}
														>
															{option.isCorrect ? (
																<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
															) : (
																<XCircle className="h-4 w-4 text-slate-400 shrink-0" />
															)}
															<span className="truncate">
																{option.text}
															</span>
														</div>
													)
												)}
											</div>
										)}
									</CardContent>
								)}

							<CardFooter className="py-2 text-xs text-muted-foreground">
								<div>ID: {question.questionId}</div>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
