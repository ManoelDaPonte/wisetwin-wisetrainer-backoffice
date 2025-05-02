//lib/config/formations.js
/**
 * Configuration des formations
 * Centralise les valeurs fixes utilisées pour les formations
 */

// Catégories de formations disponibles
export const FORMATION_CATEGORIES = [
	"Sécurité",
	"Qualité",
	"Production",
	"Maintenance",
	"Logistique",
	"RH",
	"Autre",
];

// Niveaux de difficulté disponibles
export const FORMATION_DIFFICULTY_LEVELS = [
	"Débutant",
	"Intermédiaire",
	"Avancé",
	"Expert",
];

// Durées estimées typiques
export const FORMATION_DURATIONS = [
	"15 min",
	"30 min",
	"45 min",
	"1 heure",
	"1h30",
	"2 heures",
	"3 heures+",
];

// Valeurs par défaut pour une nouvelle formation
export const DEFAULT_FORMATION = {
	externalId: "",
	name: "",
	description: "",
	imageUrl: "",
	category: "Sécurité",
	difficulty: "Intermédiaire",
	duration: "30 min",
	isPublic: false,
};
