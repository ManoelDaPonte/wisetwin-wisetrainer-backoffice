//app/api/formations/[id]/route.jsx
import { NextResponse } from "next/server";
import { getFormationById } from "@/lib/services/formations/formationsService";

export async function GET(request, { params }) {
	try {
		const id = params.id;

		if (!id) {
			return NextResponse.json(
				{ error: "ID de formation requis" },
				{ status: 400 }
			);
		}

		const formation = await getFormationById(id);

		return NextResponse.json({ formation });
	} catch (error) {
		console.error("Erreur lors de la récupération de la formation:", error);
		return NextResponse.json(
			{
				error:
					"Erreur lors de la récupération de la formation: " +
					error.message,
			},
			{ status: error.message.includes("non trouvée") ? 404 : 500 }
		);
	}
}
