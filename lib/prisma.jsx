// lib/prisma.js
import { PrismaClient } from "@prisma/client";

// Éviter de créer plusieurs instances de Prisma Client en développement
// (Hot Reloading)
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Fonctions pour les formations
export async function getAllCourses() {
	return await prisma.course.findMany({
		include: {
			OrganizationTraining: true,
		},
	});
}

export async function getCourseById(id) {
	return await prisma.course.findUnique({
		where: { id },
		include: {
			OrganizationTraining: {
				include: {
					organization: true,
				},
			},
		},
	});
}

// Fonctions pour les organisations
export async function getAllOrganizations() {
	return await prisma.organization.findMany();
}

export async function getOrganizationById(id) {
	return await prisma.organization.findUnique({
		where: { id },
		include: {
			trainings: {
				include: {
					course: true,
				},
			},
		},
	});
}

// Fonctions pour les associations builds/organisations
export async function getBuildAssociations(buildId) {
	return await prisma.organizationTraining.findMany({
		where: { buildId },
		include: {
			organization: true,
			course: true,
		},
	});
}

export async function associateBuildWithOrganization(
	buildId,
	organizationId,
	courseId
) {
	// Vérifier si l'association existe déjà
	const existingAssociation = await prisma.organizationTraining.findFirst({
		where: {
			organizationId,
			courseId,
		},
	});

	if (existingAssociation) {
		// Mettre à jour l'association existante
		return await prisma.organizationTraining.update({
			where: {
				id: existingAssociation.id,
			},
			data: {
				buildId,
				isCustomBuild: true,
			},
		});
	} else {
		// Créer une nouvelle association
		return await prisma.organizationTraining.create({
			data: {
				organizationId,
				courseId,
				buildId,
				isCustomBuild: true,
			},
		});
	}
}

export async function removeBuildAssociation(
	buildId,
	organizationId,
	courseId
) {
	// Soit on supprime complètement l'association
	// return await prisma.organizationTraining.deleteMany({
	//   where: {
	//     buildId,
	//     organizationId,
	//     courseId
	//   }
	// });

	// Soit on efface juste la référence au build
	return await prisma.organizationTraining.updateMany({
		where: {
			buildId,
			organizationId,
			courseId,
		},
		data: {
			buildId: null,
			isCustomBuild: false,
		},
	});
}

// Fonction pour récupérer les organisations associées à un build
export async function getOrganizationsForBuild(buildId) {
	const associations = await prisma.organizationTraining.findMany({
		where: { buildId },
		include: {
			organization: true,
		},
	});

	return associations.map((assoc) => ({
		id: assoc.organization.id,
		name: assoc.organization.name,
		courseId: assoc.courseId,
		assignedAt: assoc.assignedAt,
	}));
}

// Fonction pour récupérer les formations associées à un build
export async function getCoursesForBuild(buildId) {
	const associations = await prisma.organizationTraining.findMany({
		where: { buildId },
		include: {
			course: true,
		},
	});

	// Dédupliquer les formations (car un build peut être associé plusieurs fois à la même formation via différentes organisations)
	const coursesMap = {};
	associations.forEach((assoc) => {
		if (!coursesMap[assoc.course.id]) {
			coursesMap[assoc.course.id] = {
				id: assoc.course.id,
				name: assoc.course.name,
				organizationsCount: 1,
			};
		} else {
			coursesMap[assoc.course.id].organizationsCount++;
		}
	});

	return Object.values(coursesMap);
}
