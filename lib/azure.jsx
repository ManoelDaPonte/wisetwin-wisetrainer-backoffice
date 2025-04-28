// lib/azure.js
import {
	BlobServiceClient,
	StorageSharedKeyCredential,
} from "@azure/storage-blob";

// Configuration Azure
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

// Extensions de fichiers typiques pour les builds Unity WebGL
const unityBuildExtensions = [
	".framework.js.gz",
	".data.gz",
	".loader.js",
	".wasm.gz",
];

// Fonction pour initialiser le client Azure Blob Storage
function getBlobServiceClient() {
	// Vérifier si nous avons une connection string
	if (connectionString) {
		return BlobServiceClient.fromConnectionString(connectionString);
	}

	// Sinon, utiliser les credentials
	if (!accountName || !accountKey) {
		throw new Error(
			"Les variables d'environnement Azure ne sont pas configurées correctement"
		);
	}

	const sharedKeyCredential = new StorageSharedKeyCredential(
		accountName,
		accountKey
	);
	return new BlobServiceClient(
		`https://${accountName}.blob.core.windows.net`,
		sharedKeyCredential
	);
}

// Récupérer la liste des containers
export async function getContainers() {
	const blobServiceClient = getBlobServiceClient();
	const containers = [];

	for await (const container of blobServiceClient.listContainers()) {
		containers.push({
			name: container.name,
			properties: container.properties,
		});
	}

	return containers;
}

// Extraire le nom de base du build à partir du nom complet du fichier
function extractBuildBaseName(blobName) {
	// Supprimer le chemin (dossier) s'il existe
	let baseName = blobName;
	if (baseName.includes("/")) {
		baseName = baseName.split("/").pop();
	}

	// Supprimer les extensions spécifiques aux builds Unity
	for (const ext of unityBuildExtensions) {
		if (baseName.endsWith(ext)) {
			return baseName.substring(0, baseName.length - ext.length);
		}
	}

	// Si aucune extension Unity n'est trouvée, retourner le nom tel quel
	return baseName;
}

// Récupérer la liste des builds dans un container
export async function getBuildsFromContainer(containerName) {
	const blobServiceClient = getBlobServiceClient();
	const containerClient = blobServiceClient.getContainerClient(containerName);
	const builds = {};
	const buildFiles = {};

	try {
		// Vérifier si le container existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			console.warn(`Le container ${containerName} n'existe pas.`);
			return [];
		}

		// Récupérer tous les blobs du container
		for await (const blob of containerClient.listBlobsFlat()) {
			// Récupérer le nom de base du build
			const buildName = extractBuildBaseName(blob.name);
			const folderPath = blob.name.includes("/")
				? blob.name.substring(0, blob.name.lastIndexOf("/") + 1)
				: "";

			// Utiliser le chemin complet + nom de base comme identifiant unique
			const buildId = `${folderPath}${buildName}`;

			// Si c'est la première fois qu'on rencontre ce build, on l'initialise
			if (!builds[buildId]) {
				// Récupérer les propriétés du blob (pour les métadonnées)
				const blobClient = containerClient.getBlobClient(blob.name);
				const properties = await blobClient.getProperties();
				const metadata = properties.metadata || {};

				builds[buildId] = {
					id: `${containerName}:${buildId}`, // ID unique global avec le nom du container
					internalId: buildId,
					name: metadata.name || buildName,
					fullPath: folderPath,
					version: metadata.version || "1.0",
					description: metadata.description || "",
					size: 0, // Sera calculé en additionnant la taille de tous les fichiers
					uploadDate: new Date(
						properties.lastModified
					).toLocaleDateString("fr-FR"),
					lastModified: properties.lastModified, // Pour le tri
					status: "published",
					contentType: properties.contentType,
					uploadProgress: 100,
					url: "", // URL principale (sera définie plus tard)
					baseUrl: blobClient.url.replace(blob.name, ""),
					metadata: metadata,
					containerName: containerName,
					files: [], // Liste des fichiers associés à ce build
				};
				buildFiles[buildId] = {};
			}

			// Ajouter ce fichier à la liste des fichiers du build
			const fileExt = getFileExtension(blob.name);
			buildFiles[buildId][fileExt] = blob.name;

			// Ajouter la taille du blob à la taille totale du build
			const blobClient = containerClient.getBlobClient(blob.name);
			const properties = await blobClient.getProperties();
			builds[buildId].size += properties.contentLength;

			// Ajouter le fichier à la liste des fichiers du build
			builds[buildId].files.push({
				name: blob.name,
				size: formatFileSize(properties.contentLength),
				type: fileExt,
				url: containerClient.getBlobClient(blob.name).url,
			});
		}

		// Pour chaque build, définir l'URL principale comme l'URL du fichier loader.js
		Object.keys(builds).forEach((buildId) => {
			const build = builds[buildId];

			// Chercher le fichier loader.js
			const loaderFile = build.files.find((file) =>
				file.name.endsWith(".loader.js")
			);
			if (loaderFile) {
				build.url = loaderFile.url;
			} else if (build.files.length > 0) {
				// Si pas de loader.js, utiliser le premier fichier
				build.url = build.files[0].url;
			}

			// Mettre à jour la taille totale du build
			build.totalSize = formatFileSize(build.size);
		});

		// Convertir l'objet builds en tableau
		return Object.values(builds);
	} catch (error) {
		console.error(
			`Erreur lors de la récupération des builds du container ${containerName}:`,
			error
		);
		throw error;
	}
}

// Obtenir l'extension d'un fichier
function getFileExtension(filename) {
	// Pour les fichiers Unity spécifiques
	for (const ext of unityBuildExtensions) {
		if (filename.endsWith(ext)) {
			return ext;
		}
	}

	// Pour les autres types de fichiers
	const lastDotIndex = filename.lastIndexOf(".");
	if (lastDotIndex !== -1) {
		return filename.substring(lastDotIndex);
	}
	return "";
}

// Récupérer tous les builds de tous les containers
export async function getAllBuilds() {
	try {
		const containers = await getContainers();
		let allBuilds = [];

		for (const container of containers) {
			// On ignore les containers système ou qui ne seraient pas destinés aux builds
			if (
				!container.name.startsWith("$") &&
				!container.name.includes("system")
			) {
				const builds = await getBuildsFromContainer(container.name);
				allBuilds = [...allBuilds, ...builds];
			}
		}

		return allBuilds;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de tous les builds:",
			error
		);
		throw error;
	}
}

// Récupérer les détails d'un build spécifique
export async function getBuildDetails(containerName, buildId) {
	try {
		// Récupérer tous les builds du container
		const builds = await getBuildsFromContainer(containerName);

		// Trouver le build spécifique
		const build = builds.find((b) => b.internalId === buildId);

		if (!build) {
			throw new Error(
				`Build ${buildId} introuvable dans le container ${containerName}`
			);
		}

		return build;
	} catch (error) {
		console.error(
			`Erreur lors de la récupération des détails du build ${buildId}:`,
			error
		);
		throw error;
	}
}

// Formater la taille du fichier
function formatFileSize(bytes) {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Uploader un nouveau build
export async function uploadBuild(containerName, files, metadata = {}) {
	const blobServiceClient = getBlobServiceClient();
	const containerClient = blobServiceClient.getContainerClient(containerName);

	// Vérifier si le container existe, sinon le créer
	const containerExists = await containerClient.exists();
	if (!containerExists) {
		await containerClient.create({
			access: "blob", // Accès public pour les blobs individuels
		});
	}

	const uploadResults = [];
	const basePath = metadata.folderPath || "";
	const timestamp = Date.now();

	try {
		for (const file of files) {
			// Construire le nom du blob
			const blobName = `${basePath}${timestamp}-${file.name}`;
			const blockBlobClient =
				containerClient.getBlockBlobClient(blobName);

			// Options d'upload
			const options = {
				blobHTTPHeaders: {
					blobContentType: file.type || "application/octet-stream",
				},
				metadata: {
					...metadata,
					originalName: file.name,
				},
			};

			// Upload du fichier
			const buffer = await file.arrayBuffer();
			const uploadResponse = await blockBlobClient.uploadData(
				new Uint8Array(buffer),
				options
			);

			uploadResults.push({
				name: file.name,
				blobName,
				url: blockBlobClient.url,
				etag: uploadResponse.etag,
			});
		}

		return {
			success: true,
			buildName: metadata.name || `Build_${timestamp}`,
			files: uploadResults,
			metadata,
		};
	} catch (error) {
		console.error(`Erreur lors de l'upload des fichiers:`, error);
		throw error;
	}
}

// Supprimer un build (tous les fichiers associés)
export async function deleteBuild(containerName, buildId) {
	const blobServiceClient = getBlobServiceClient();
	const containerClient = blobServiceClient.getContainerClient(containerName);

	try {
		// Récupérer tous les builds du container
		const builds = await getBuildsFromContainer(containerName);

		// Trouver le build spécifique
		const build = builds.find((b) => b.internalId === buildId);

		if (!build) {
			throw new Error(
				`Build ${buildId} introuvable dans le container ${containerName}`
			);
		}

		// Supprimer tous les fichiers associés au build
		for (const file of build.files) {
			const blockBlobClient = containerClient.getBlockBlobClient(
				file.name
			);
			await blockBlobClient.delete();
		}

		return { success: true };
	} catch (error) {
		console.error(
			`Erreur lors de la suppression du build ${buildId}:`,
			error
		);
		throw error;
	}
}

// Mettre à jour les métadonnées d'un build
export async function updateBuildMetadata(containerName, buildId, metadata) {
	const blobServiceClient = getBlobServiceClient();
	const containerClient = blobServiceClient.getContainerClient(containerName);

	try {
		// Récupérer tous les builds du container
		const builds = await getBuildsFromContainer(containerName);

		// Trouver le build spécifique
		const build = builds.find((b) => b.internalId === buildId);

		if (!build) {
			throw new Error(
				`Build ${buildId} introuvable dans le container ${containerName}`
			);
		}

		// Mettre à jour les métadonnées pour tous les fichiers du build
		for (const file of build.files) {
			const blockBlobClient = containerClient.getBlockBlobClient(
				file.name
			);
			await blockBlobClient.setMetadata(metadata);
		}

		return { success: true, metadata };
	} catch (error) {
		console.error(
			`Erreur lors de la mise à jour des métadonnées du build ${buildId}:`,
			error
		);
		throw error;
	}
}
