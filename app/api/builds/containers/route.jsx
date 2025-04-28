// app/api/builds/containers/route.js
import { NextResponse } from "next/server";
import { getContainers } from "@/lib/azure";

export async function GET() {
	try {
		// Récupérer la liste des containers
		const containers = await getContainers();

		// Filtrer les containers système ou qui ne sont pas destinés aux builds
		const filteredContainers = containers.filter(
			(container) =>
				!container.name.startsWith("$") &&
				!container.name.includes("system")
		);

		return NextResponse.json({ containers: filteredContainers });
	} catch (error) {
		console.error("Erreur lors de la récupération des containers:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la récupération des containers" },
			{ status: 500 }
		);
	}
}
