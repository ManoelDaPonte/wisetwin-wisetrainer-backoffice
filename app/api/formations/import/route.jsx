// app/api/formations/import/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
	try {
		const { formation } = await request.json();

		// Validation de base
		if (!formation || !formation.id || !formation.name) {
			return NextResponse.json(
				{ error: "JSON de formation invalide ou incomplet" },
				{ status: 400 }
			);
		}

		// Vérifier si une formation avec cet ID externe existe déjà
		const existingFormation = await prisma.formation.findUnique({
			where: { formationId: formation.id },
		});

		if (existingFormation) {
			return NextResponse.json(
				{
					error: `Une formation avec l'ID '${formation.id}' existe déjà`,
				},
				{ status: 409 }
			);
		}

		// Démarrer une transaction
		const result = await prisma.$transaction(async (tx) => {
			// 1. Créer la formation
			const createdFormation = await tx.formation.create({
				data: {
					formationId: formation.id,
					name: formation.name,
					description: formation.description || "",
					imageUrl: formation.imageUrl || null,
					category: formation.category || "Non catégorisé",
					difficulty: formation.difficulty || "Intermédiaire",
					duration: formation.duration || "30 min",
					objectMapping: formation.objectMapping || {},
				},
			});

			// 2. Créer les modules/contenus
			if (formation.modules && Array.isArray(formation.modules)) {
				for (let i = 0; i < formation.modules.length; i++) {
					const module = formation.modules[i];

					// Créer le contenu
					const content = await tx.formationContent.create({
						data: {
							contentId: module.id,
							formationId: createdFormation.id,
							title: module.title,
							description: module.description || "",
							type: module.type || "guide",
							order: module.order || i + 1,
							educationalTitle: module.educational?.title || null,
							educationalText: module.educational
								? JSON.stringify(module.educational.content)
								: null,
							imageUrl: module.educational?.imageUrl || null,
						},
					});

					// Si c'est un guide avec des étapes
					if (module.steps && Array.isArray(module.steps)) {
						// Créer les étapes
						for (const step of module.steps) {
							await tx.formationStep.create({
								data: {
									stepId: step.id,
									contentId: content.id,
									title: step.title,
									instruction: step.instruction,
									validationEvent: step.validationEvent,
									validationType: step.validationType || "3d",
									hint: step.hint || null,
								},
							});
						}
					}

					// Si ce sont des questions
					if (module.questions && Array.isArray(module.questions)) {
						for (const question of module.questions) {
							// Créer la question
							const createdQuestion =
								await tx.formationQuestion.create({
									data: {
										questionId: question.id,
										contentId: content.id,
										text: question.text,
										type: question.type || "SINGLE",
										image: question.image || null,
									},
								});

							// Créer les options de réponse
							if (
								question.options &&
								Array.isArray(question.options)
							) {
								for (const option of question.options) {
									await tx.formationOption.create({
										data: {
											optionId: option.id,
											questionId: createdQuestion.id,
											text: option.text,
											isCorrect:
												option.isCorrect || false,
										},
									});
								}
							}
						}
					}
				}
			}

			return createdFormation;
		});

		return NextResponse.json({
			success: true,
			message: "Formation importée avec succès",
			id: result.id,
			formationId: result.formationId,
		});
	} catch (error) {
		console.error("Erreur lors de l'importation de la formation:", error);
		return NextResponse.json(
			{ error: "Erreur lors de l'importation: " + error.message },
			{ status: 500 }
		);
	}
}
