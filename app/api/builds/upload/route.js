// app/api/builds/upload/route.js
import { NextResponse } from 'next/server';
import { getBlobServiceClient, uploadBuild } from '@/lib/azure';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    // Vérifier que la demande provient d'un administrateur (middleware s'en occupe)
    
    // Traiter le FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const version = formData.get('version');
    const description = formData.get('description') || '';
    const container = formData.get('container') || 'builds';
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Fichier manquant ou invalide' },
        { status: 400 }
      );
    }
    
    if (!name || !version) {
      return NextResponse.json(
        { error: 'Nom et version requis' },
        { status: 400 }
      );
    }
    
    // Préparer les métadonnées du build
    const metadata = {
      name: name,
      version: version,
      description: description,
      contentType: file.type,
      uploadDate: new Date().toISOString(),
    };
    
    // Convertir le fichier en buffer pour l'upload
    const buffer = await file.arrayBuffer();
    
    // Créer un BlobClient et uploader le fichier
    const blobServiceClient = getBlobServiceClient();
    
    // Vérifier si le container existe, sinon le créer
    const containerClient = blobServiceClient.getContainerClient(container);
    const containerExists = await containerClient.exists();
    
    if (!containerExists) {
      await containerClient.create({
        access: 'blob' // Accès public pour les blobs individuels
      });
    }
    
    // Créer un nom unique pour le blob
    const blobName = `${Date.now()}-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-v${version}.zip`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const options = {
      blobHTTPHeaders: {
        blobContentType: file.type || 'application/zip'
      },
      metadata: metadata
    };
    
    const uploadResponse = await blockBlobClient.uploadData(new Uint8Array(buffer), options);
    
    // Retourner les informations du build
    return NextResponse.json({
      success: true,
      build: {
        id: blobName,
        name: metadata.name,
        version: metadata.version,
        description: metadata.description,
        containerName: container,
        url: blockBlobClient.url,
        uploadDate: new Date().toLocaleDateString('fr-FR'),
        size: formatFileSize(buffer.byteLength),
        status: 'published',
        uploadProgress: 100,
        etag: uploadResponse.etag
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'upload du build:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload: ' + error.message },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}