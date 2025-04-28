// app/api/courses/route.js
import { NextResponse } from "next/server";
import { getAllCourses, getCourseById } from "@/lib/prisma";

export async function GET(request) {
	try {
		// Récupérer le paramètre id de l'URL
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (id) {
			// Récupérer une formation spécifique
			const course = await getCourseById(id);

			if (!course) {
				return NextResponse.json(
					{ error: "Formation non trouvée" },
					{ status: 404 }
				);
			}

			return NextResponse.json({ course });
		} else {
			// Récupérer toutes les formations
			const courses = await getAllCourses();
			return NextResponse.json({ courses });
		}
	} catch (error) {
		console.error("Erreur lors de la récupération des formations:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération des formations: " +
					error.message,
			},
			{ status: 500 }
		);
	}
}
