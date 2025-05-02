//app/api/organizations/route.jsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
	try {
		const organizations = await prisma.organization.findMany({
			orderBy: {
				name: "asc",
			},
		});

		return NextResponse.json({ organizations });
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
