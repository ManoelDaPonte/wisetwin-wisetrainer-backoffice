# WiseTwin Admin - Module de gestion des formations

Ce module d'administration permet de gérer les formations qui sont actuellement stockées sous forme de fichiers JSON dans l'application principale.

## Fonctionnalités

### Gestion des formations

-   ✅ Affichage de la liste des formations
-   ✅ Visualisation détaillée d'une formation
-   ✅ Création d'une nouvelle formation
-   ✅ Modification d'une formation existante
-   ✅ Suppression d'une formation
-   ✅ Duplication d'une formation
-   ✅ Importation d'une formation depuis un fichier JSON
-   ✅ Exportation d'une formation au format JSON

### Gestion des modules

-   ✅ Affichage de la liste des modules d'une formation
-   ✅ Création d'un nouveau module
-   ✅ Modification d'un module existant
-   ✅ Suppression d'un module
-   ✅ Réorganisation des modules (déplacer vers le haut/bas)
-   ⬜ Éditeur de séquence guidée (à implémenter)
-   ⬜ Éditeur de questionnaire (à implémenter)

### Tableau de bord

-   ✅ Statistiques sur les formations
-   ✅ Répartition par catégorie
-   ✅ Activité récente

## Structure du projet

### Composants importants

-   `components/formations/FormationsContainer.jsx` : Conteneur principal pour la gestion des formations
-   `components/formations/FormationsTable.jsx` : Tableau des formations
-   `components/formations/FormationsGrid.jsx` : Affichage en grille des formations
-   `components/formations/FormationForm.jsx` : Formulaire d'édition/création de formation
-   `components/formations/FormationImportDialog.jsx` : Dialogue d'importation de JSON
-   `components/formations/ModulesManager.jsx` : Gestionnaire des modules d'une formation
-   `components/formations/ModuleEditDialog.jsx` : Dialogue d'édition d'un module

### Routes API

#### Formations

-   `GET /api/formations` : Récupérer toutes les formations
-   `GET /api/formations/[id]` : Récupérer une formation spécifique
-   `POST /api/formations` : Créer une nouvelle formation
-   `PATCH /api/formations/[id]` : Mettre à jour une formation
-   `DELETE /api/formations/[id]` : Supprimer une formation
-   `POST /api/formations/import` : Importer une formation depuis un JSON
-   `GET /api/formations/export/[id]` : Exporter une formation au format JSON
-   `POST /api/formations/duplicate/[id]` : Dupliquer une formation

#### Modules

-   `GET /api/formations/[id]/modules` : Récupérer tous les modules d'une formation
-   `POST /api/formations/[id]/modules` : Créer un nouveau module
-   `GET /api/formations/[id]/modules/[moduleId]` : Récupérer un module spécifique
-   `PATCH /api/formations/[id]/modules/[moduleId]` : Mettre à jour un module
-   `DELETE /api/formations/[id]/modules/[moduleId]` : Supprimer un module
-   `PATCH /api/formations/[id]/modules/[moduleId]/move` : Déplacer un module (haut/bas)

## Modèles de données (Prisma)

Le schéma Prisma a été étendu pour prendre en charge les formations :

```prisma
// Formation: entité principale
model Formation {
  id               String             @id @default(uuid())
  formationId      String             @unique // Identifiant externe (ex: "LOTO_Acces_Zone_Robot")
  name             String             // Nom de la formation
  description      String             // Description de la formation
  imageUrl         String?            // URL de l'image
  category         String             // Catégorie (ex: "Sécurité")
  difficulty       String             // Difficulté (ex: "Intermédiaire")
  duration         String             // Durée estimée (ex: "45 min")
  objectMapping    Json?              // Mapping des objets 3D (JSON)
  buildId          String?            // Référence au build Unity (optionnel)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  // Relations
  contents         FormationContent[] // Modules de la formation
}

// Module: partie d'une formation avec séquence interactive ou questionnaire
model FormationContent {
  id               String             @id @default(uuid())
  contentId        String             // Identifiant externe (ex: "controller-guide")
  formationId      String             // Référence à la formation parente
  formation        Formation          @relation(fields: [formationId], references: [id], onDelete: Cascade)
  title            String             // Titre du module
  description      String             // Description du module
  type             String             @default("guide") // "guide" ou "question"
  order            Int                // Ordre d'affichage dans la formation
  educationalTitle String?            // Titre du contenu éducatif (optional)
  educationalText  String?            @db.Text // Contenu éducatif (JSON ou texte formaté)
  imageUrl         String?            // URL de l'image du module
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  // Relations
  steps            FormationStep[]    // Étapes guidées (pour type=guide)
  questions        FormationQuestion[] // Questions (pour type=question)
}
```

## Scripts utilitaires

### Migration des formations existantes

Un script de migration a été créé pour importer les formations JSON existantes dans la base de données :

```bash
# Importer une seule formation
node scripts/migrate-formations.js path/to/formation.json

# Importer toutes les formations d'un dossier
node scripts/migrate-formations.js path/to/formations/folder

# Exécuter en mode simulation sans effectuer de modifications
node scripts/migrate-formations.js path/to/formations/folder --dry-run

# Écraser les formations existantes avec le même ID
node scripts/migrate-formations.js path/to/formations/folder --overwrite
```

## Comment utiliser

### Import d'une formation JSON existante

1. Accédez à la page des formations
2. Cliquez sur le bouton "Importer un JSON"
3. Sélectionnez ou glissez-déposez le fichier JSON
4. Vérifiez les informations de la formation
5. Cliquez sur "Importer"

### Création d'une nouvelle formation

1. Accédez à la page des formations
2. Cliquez sur le bouton "Nouvelle formation"
3. Remplissez le formulaire avec les informations requises
4. Cliquez sur "Enregistrer"
5. Vous serez redirigé vers la page d'édition de la formation

### Gestion des modules

1. Accédez à la page d'édition d'une formation
2. Cliquez sur le bouton "Gérer les modules"
3. Vous pouvez ajouter, modifier, supprimer ou réorganiser les modules

## Développements futurs

### Fonctionnalités à venir

-   Éditeur visuel pour les séquences guidées
-   Éditeur de questions avec aperçu
-   Gestion des médias (images, vidéos)
-   Intégration avec les builds Unity
-   Prévisualisation des formations

### Problèmes connus

-   L'édition du contenu éducatif en JSON brut n'est pas conviviale
-   La prévisualisation des formations n'est pas encore disponible
-   Absence de validation avancée pour les fichiers JSON importés

## Contributions

Pour contribuer à ce projet :

1. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
2. Effectuez vos modifications
3. Soumettez une Pull Request avec une description détaillée des changements

## Licence

Propriétaire - Tous droits réservés
