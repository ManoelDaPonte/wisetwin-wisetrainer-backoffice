//lib/azure.jsx
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
	if (connectionString) {
		return BlobServiceClient.fromConnectionString(connectionString);
	}

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

// Vérifier si un build Unity est complet (contient les 4 fichiers requis)
function isUnityBuildComplete(buildFiles) {
	console.log("isUnityBuildComplete: Vérification des fichiers", buildFiles.map(f => f.name));
	
	const requiredExtensions = [
		".data.gz",
		".framework.js.gz",
		".loader.js",
		".wasm.gz",
	];

	// Vérifier chaque extension requise
	for (const ext of requiredExtensions) {
		const found = buildFiles.some((file) => file.name.endsWith(ext));
		console.log(`Extension ${ext}: ${found ? 'trouvée' : 'manquante'}`);
		if (!found) {
			return false;
		}
	}
	
	console.log("isUnityBuildComplete: Build complet");
	return true;
}

// Récupérer la liste des builds dans un container
export async function getBuildsFromContainer(containerName) {
	const blobServiceClient = getBlobServiceClient();
	const containerClient = blobServiceClient.getContainerClient(containerName);
	const buildsMap = {};
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
			const buildBaseName = extractBuildBaseName(blob.name);
			const folderPath = blob.name.includes("/")
				? blob.name.substring(0, blob.name.lastIndexOf("/") + 1)
				: "";

			const buildId = `${folderPath}${buildBaseName}`;

			// Initialiser le build si nécessaire
			if (!buildsMap[buildId]) {
				const blobClient = containerClient.getBlobClient(blob.name);
				const properties = await blobClient.getProperties();
				const metadata = properties.metadata || {};

				buildsMap[buildId] = {
					id: `${containerName}:${buildId}`,
					internalId: buildId,
					name: metadata.name || buildBaseName,
					fullPath: folderPath,
					version: metadata.version || "1.0",
					description: metadata.description || "",
					size: 0,
					uploadDate: new Date(
						properties.lastModified
					).toLocaleDateString("fr-FR"),
					lastModified: properties.lastModified,
					status: "published",
					contentType: properties.contentType,
					uploadProgress: 100,
					url: "",
					baseUrl: blobClient.url.replace(blob.name, ""),
					metadata: metadata,
					containerName: containerName,
					files: [],
				};
				buildFiles[buildId] = [];
			}

			// Ajouter ce fichier à la liste
			buildFiles[buildId].push({
				name: blob.name,
				size: blob.properties.contentLength,
				type: getFileExtension(blob.name),
				url: containerClient.getBlobClient(blob.name).url,
			});

			buildsMap[buildId].size += blob.properties.contentLength;
		}

		// Filtrer pour ne garder que les builds complets et mettre à jour les infos
		const completeBuilds = [];
		Object.entries(buildsMap).forEach(([buildId, build]) => {
			const files = buildFiles[buildId];

			if (isUnityBuildComplete(files)) {
				// Mettre à jour les fichiers du build
				build.files = files;

				// Trouver l'URL du loader.js
				const loaderFile = files.find((file) =>
					file.name.endsWith(".loader.js")
				);
				if (loaderFile) {
					build.url = loaderFile.url;
				}

				// Mettre à jour la taille totale
				build.totalSize = formatFileSize(build.size);

				completeBuilds.push(build);
			} else {
				console.warn(
					`Build ${buildId} incomplet (${files.length} fichiers sur 4 requis)`
				);
			}
		});

		return completeBuilds;
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
	for (const ext of unityBuildExtensions) {
		if (filename.endsWith(ext)) {
			return ext;
		}
	}

	const lastDotIndex = filename.lastIndexOf(".");
	if (lastDotIndex !== -1) {
		return filename.substring(lastDotIndex);
	}
	return "";
}

// Nettoyer les métadonnées pour Azure Blob Storage
function cleanMetadataForAzure(metadata) {
    const cleanMetadata = {};
    
    // Azure n'accepte que des caractères alphanumériques dans les clés et valeurs des métadonnées
    Object.entries(metadata).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return; // Ignorer les valeurs nulles/undefined
        }
        
        // Convertir les valeurs en chaînes et remplacer les caractères non autorisés
        let cleanKey = key.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
        let cleanValue = String(value).replace(/[^a-zA-Z0-9_. -]/g, "_");
        
        // Les clés doivent commencer par une lettre ou un chiffre
        if (!/^[a-zA-Z0-9]/.test(cleanKey)) {
            cleanKey = "x_" + cleanKey;
        }
        
        // Vérifier la longueur (Azure a une limite)
        if (cleanValue.length > 256) {
            cleanValue = cleanValue.substring(0, 256);
        }
        
        cleanMetadata[cleanKey] = cleanValue;
    });
    
    return cleanMetadata;
}

// Uploader un nouveau build (version adaptée)
export async function uploadUnityBuild(containerName, files, metadata = {}) {
	console.log("azure.uploadUnityBuild: Début", {
		containerName,
		filesCount: files.length,
		metadata
	});
	
	const blobServiceClient = getBlobServiceClient();
	const containerClient = blobServiceClient.getContainerClient(containerName);

	// Vérifier si les 4 fichiers requis sont présents
	const requiredExtensions = [
		".data.gz",
		".framework.js.gz",
		".loader.js",
		".wasm.gz",
	];
	
	// Afficher les noms de fichiers pour débogage
	console.log("azure.uploadUnityBuild: Fichiers reçus:", files.map(f => f.name));
	
	const fileExtensions = [];
	
	// Vérification plus robuste des extensions
	for (const file of files) {
		const fileName = file.name;
		console.log(`Analyse du fichier: ${fileName}`);
		
		// Chercher l'extension requise dans le nom de fichier
		let matched = false;
		for (const ext of requiredExtensions) {
			if (fileName.endsWith(ext)) {
				console.log(`-> Correspond à l'extension: ${ext}`);
				fileExtensions.push(ext);
				matched = true;
				break;
			}
		}
		
		// Si aucune correspondance, utiliser l'extension classique
		if (!matched) {
			const lastDotIndex = fileName.lastIndexOf(".");
			if (lastDotIndex !== -1) {
				const ext = fileName.substring(lastDotIndex);
				console.log(`-> Extension standard: ${ext}`);
				fileExtensions.push(ext);
			} else {
				console.log("-> Aucune extension trouvée");
				fileExtensions.push("");
			}
		}
	}
	
	console.log("azure.uploadUnityBuild: Extensions détectées:", fileExtensions);

	const missingFiles = requiredExtensions.filter(
		(ext) => !fileExtensions.includes(ext)
	);

	if (missingFiles.length > 0) {
		console.error("azure.uploadUnityBuild: Extensions manquantes:", missingFiles);
		throw new Error(
			`Fichiers manquants pour un build Unity complet : ${missingFiles.join(
				", "
			)}`
		);
	}
	
	console.log("azure.uploadUnityBuild: Validation des fichiers réussie");

	// Vérifier si le container existe, sinon le créer
	const containerExists = await containerClient.exists();
	if (!containerExists) {
		await containerClient.create({
			access: "blob",
		});
	}

	const uploadResults = [];
	const basePath = metadata.folderPath || "";
	const buildName = metadata.name || `Build_${Date.now()}`;
	const buildBaseName = buildName.replace(/\.[^/.]+$/, "");

	try {
		for (const file of files) {
			// Construire le nom du blob avec la structure attendue
			let blobName;
			if (file.name.endsWith(".data.gz")) {
				blobName = `${basePath}${buildBaseName}.data.gz`;
			} else if (file.name.endsWith(".framework.js.gz")) {
				blobName = `${basePath}${buildBaseName}.framework.js.gz`;
			} else if (file.name.endsWith(".loader.js")) {
				blobName = `${basePath}${buildBaseName}.loader.js`;
			} else if (file.name.endsWith(".wasm.gz")) {
				blobName = `${basePath}${buildBaseName}.wasm.gz`;
			} else {
				// Fichier non reconnu, on utilise le nom tel quel
				blobName = `${basePath}${file.name}`;
			}

			const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            // Préparer les métadonnées nettoyées pour Azure
            const fileMetadata = cleanMetadataForAzure({
                ...metadata,
                originalname: file.name,
                buildname: buildBaseName,
            });
            
            console.log("Métadonnées nettoyées pour Azure:", fileMetadata);

			// Options d'upload
			const options = {
				blobHTTPHeaders: {
					blobContentType: file.type || "application/octet-stream",
				},
				metadata: fileMetadata,
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
			buildName: buildBaseName,
			files: uploadResults,
			metadata,
		};
	} catch (error) {
		console.error(`Erreur lors de l'upload des fichiers:`, error);
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

// Export des autres fonctions existantes...
export {
	getContainers,
	getAllBuilds,
	getBuildDetails,
	deleteBuild,
	updateBuildMetadata,
};