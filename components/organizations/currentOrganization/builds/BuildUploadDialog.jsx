//components/organizations/currentOrganization/builds/BuildUploadDialog.jsx
"use client";

import { useState, useRef } from "react";
import {
	Upload,
	X,
	CheckCircle,
	AlertCircle,
	Loader2,
	FileUp,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BuildUploadDialog({ isOpen, onClose, onUpload }) {
	const [files, setFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		version: "1.0",
		description: "",
	});
	const fileInputRef = useRef(null);

	// Vérification des fichiers requis pour Unity
	const requiredFiles = [
		{ ext: ".data.gz", label: "Données (.data.gz)" },
		{ ext: ".framework.js.gz", label: "Framework (.framework.js.gz)" },
		{ ext: ".loader.js", label: "Loader (.loader.js)" },
		{ ext: ".wasm.gz", label: "WebAssembly (.wasm.gz)" },
	];

	const checkRequiredFiles = (fileList) => {
		const uploadedFileNames = fileList.map((f) => f.name.toLowerCase());
		return requiredFiles.every((req) =>
			uploadedFileNames.some((name) => name.endsWith(req.ext))
		);
	};

	const getMissingFiles = (fileList) => {
		const uploadedFileNames = fileList.map((f) => f.name.toLowerCase());
		return requiredFiles
			.filter(
				(req) =>
					!uploadedFileNames.some((name) => name.endsWith(req.ext))
			)
			.map((req) => req.label);
	};

	const extractBuildName = (fileList) => {
		// Trouver le fichier loader.js pour extraire le nom de base
		const loaderFile = fileList.find((f) =>
			f.name.toLowerCase().endsWith(".loader.js")
		);
		if (loaderFile) {
			return loaderFile.name.replace(/\.loader\.js$/i, "");
		}
		return "";
	};

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		if (selectedFiles.length > 0) {
			setFiles(selectedFiles);
			if (!formData.name) {
				const buildName = extractBuildName(selectedFiles);
				if (buildName) {
					setFormData({ ...formData, name: buildName });
				}
			}
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const droppedFiles = Array.from(e.dataTransfer.files);
		if (droppedFiles.length > 0) {
			setFiles(droppedFiles);
			if (!formData.name) {
				const buildName = extractBuildName(droppedFiles);
				if (buildName) {
					setFormData({ ...formData, name: buildName });
				}
			}
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (files.length === 0) {
			setError("Veuillez sélectionner au moins un fichier");
			return;
		}

		if (!checkRequiredFiles(files)) {
			const missing = getMissingFiles(files);
			setError(
				`Fichiers manquants pour un build Unity complet : ${missing.join(
					", "
				)}`
			);
			return;
		}

		if (!formData.name || !formData.version) {
			setError("Le nom et la version sont requis");
			return;
		}

		setError(null);
		setUploading(true);

		try {
			const uploadInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) clearInterval(uploadInterval);
					return Math.min(prev + 10, 90);
				});
			}, 500);

			await onUpload(files, formData);

			clearInterval(uploadInterval);
			setUploadProgress(100);
			setSuccess(true);

			setTimeout(() => {
				onClose();
				resetForm();
			}, 1500);
		} catch (err) {
			console.error("Erreur lors de l'upload:", err);
			setError(err.message || "Une erreur est survenue lors de l'upload");
			setUploadProgress(0);
		} finally {
			setUploading(false);
		}
	};

	const resetForm = () => {
		setFiles([]);
		setUploadProgress(0);
		setError(null);
		setSuccess(false);
		setFormData({
			name: "",
			version: "1.0",
			description: "",
		});
		if (fileInputRef.current) {
			fileInputRef.current.value = null;
		}
	};

	const areFilesValid = files.length > 0 && checkRequiredFiles(files);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Uploader un build Unity</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
							<CheckCircle className="h-4 w-4" />
							<AlertDescription>
								Build uploadé avec succès!
							</AlertDescription>
						</Alert>
					)}

					{/* Zone de dépôt des fichiers */}
					<div
						className={`border-2 border-dashed rounded-md p-6 text-center ${
							areFilesValid
								? "border-green-500 bg-green-50 dark:bg-green-900/20"
								: files.length > 0
								? "border-red-500 bg-red-50 dark:bg-red-900/20"
								: "border-gray-300"
						}`}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					>
						{files.length > 0 ? (
							<div className="space-y-3">
								<div className="flex items-center justify-center gap-2">
									{areFilesValid ? (
										<CheckCircle className="h-5 w-5 text-green-600" />
									) : (
										<AlertTriangle className="h-5 w-5 text-red-600" />
									)}
									<span className="font-medium">
										{files.length} fichier(s) sélectionné(s)
									</span>
								</div>

								{/* Liste des fichiers requis */}
								<div className="text-sm space-y-1">
									{requiredFiles.map((req) => {
										const hasFile = files.some((f) =>
											f.name
												.toLowerCase()
												.endsWith(req.ext)
										);
										return (
											<div
												key={req.ext}
												className={`flex items-center gap-2 ${
													hasFile
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{hasFile ? (
													<CheckCircle className="h-4 w-4" />
												) : (
													<X className="h-4 w-4" />
												)}
												<span>{req.label}</span>
											</div>
										);
									})}
								</div>

								{!areFilesValid && (
									<p className="text-sm text-red-600 mt-2">
										Veuillez ajouter tous les fichiers
										requis
									</p>
								)}
							</div>
						) : (
							<div className="space-y-3">
								<Upload className="h-8 w-8 mx-auto text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									Glissez-déposez les fichiers de votre build
									Unity ici ou
								</p>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										fileInputRef.current?.click()
									}
								>
									<FileUp className="mr-2 h-4 w-4" />
									Parcourir
								</Button>

								<div className="mt-4">
									<p className="text-xs text-muted-foreground font-medium">
										Fichiers requis :
									</p>
									<ul className="text-xs text-muted-foreground mt-1 space-y-1">
										{requiredFiles.map((req) => (
											<li key={req.ext}>• {req.label}</li>
										))}
									</ul>
								</div>
							</div>
						)}
						<input
							ref={fileInputRef}
							type="file"
							multiple
							onChange={handleFileChange}
							className="hidden"
							accept=".gz,.js"
						/>
					</div>

					{/* Formulaire des métadonnées */}
					<div className="space-y-3">
						<div>
							<Label htmlFor="name">Nom du build</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								required
								disabled={uploading}
								placeholder="ex: WiseTrainer_01"
							/>
						</div>

						<div>
							<Label htmlFor="version">Version</Label>
							<Input
								id="version"
								name="version"
								value={formData.version}
								onChange={handleInputChange}
								required
								disabled={uploading}
							/>
						</div>

						<div>
							<Label htmlFor="description">
								Description (optionnelle)
							</Label>
							<Input
								id="description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								disabled={uploading}
							/>
						</div>

						{uploading && (
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Upload en cours...</span>
									<span>{uploadProgress}%</span>
								</div>
								<Progress value={uploadProgress} />
							</div>
						)}
					</div>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={uploading}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							disabled={uploading || success || !areFilesValid}
						>
							{uploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Upload en cours...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Uploader
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
