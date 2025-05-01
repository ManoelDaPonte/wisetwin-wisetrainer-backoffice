// app/api/organizations/route.js
import { NextResponse } from "next/server";
import {
	getAllOrganizations,
	createOrganization,
} from "@/lib/services/organizations/organizationsService";

export async function GET(request) {
	try {
		const organizations = await getAllOrganizations();
		return NextResponse.json({ organizations });
	} catch (error) {
		console.error("Erreur:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		const data = await request.json();
		const organization = await createOrganization(data);
		return NextResponse.json(
			{ success: true, organization },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Erreur:", error);
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
