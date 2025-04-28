// app/api/builds/delete/route.js
import { NextResponse } from "next/server";
import { deleteBuild } from "@/lib/azure";

export async function POST(request) {
	try {
		const { container, blob } = await request.json();

		if (!container || !blob) {
			return NextResponse.json(
				{ error: "Container et blob requis" },
				{ status: 400 }
			);
		}

		// Supprimer le build
		await deleteBuild(container, blob);

		// Retourner une réponse de succès
		return NextResponse.json({
			success: true,
			message: "Build supprimé avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du build:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la suppression: " + error.message },
			{ status: 500 }
		);
	}
}
