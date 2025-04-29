// app/api/organizations/[id]/members/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les membres
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const id = params.id;
    const { email, role } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID d'organisation requis" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Vérifier les rôles valides
    const validRoles = ["OWNER", "ADMIN", "MEMBER"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Vérifier si l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur existe
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          auth0Id: `temp-${Date.now()}`, // Temporaire, à remplacer quand l'utilisateur se connecte
          name: email.split('@')[0] // Nom par défaut basé sur l'email
        }
      });
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id
      }
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Cet utilisateur est déjà membre de l'organisation" },
        { status: 409 }
      );
    }

    // Ajouter l'utilisateur comme membre
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: id,
        userId: user.id,
        role: role || "MEMBER"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      member
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du membre: " + error.message },
      { status: 500 }
    );
  }
}