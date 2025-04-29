// app/api/organizations/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
	try {
		// Récupérer toutes les organisations
		const organizations = await prisma.organization.findMany({
			include: {
				_count: {
					select: {
						members: true,
						trainings: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		// Transformer les données pour inclure les compteurs
		const formattedOrganizations = organizations.map((org) => ({
			...org,
			membersCount: org._count.members,
			trainingsCount: org._count.trainings,
			_count: undefined,
		}));

		return NextResponse.json({ organizations: formattedOrganizations });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des organisations:",
			error
		);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération des organisations: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const data = await request.json();

		// Validation de base
		if (!data.name) {
			return NextResponse.json(
				{ error: "Le nom de l'organisation est requis" },
				{ status: 400 }
			);
		}

		// Créer l'organisation
		const organization = await prisma.organization.create({
			data: {
				name: data.name,
				description: data.description || "",
				logoUrl: data.logoUrl || null,
				azureContainer: data.azureContainer || null,
				isActive: data.isActive !== undefined ? data.isActive : true,
			},
		});

		return NextResponse.json(
			{
				success: true,
				organization,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Erreur lors de la création de l'organisation:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la création de l'organisation: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
