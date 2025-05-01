//components/organizations/BuildUploadDialog.jsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		if (selectedFiles.length > 0) {
			setFiles(selectedFiles);
			if (!formData.name) {
				// Mise à jour automatique du nom
				const fileName = selectedFiles[0].name.replace(/\.[^/.]+$/, "");
				setFormData({ ...formData, name: fileName });
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
				const fileName = droppedFiles[0].name.replace(/\.[^/.]+$/, "");
				setFormData({ ...formData, name: fileName });
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

		if (!formData.name || !formData.version) {
			setError("Le nom et la version sont requis");
			return;
		}

		setError(null);
		setUploading(true);

		try {
			// Simulation de progression
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

			// Fermer après un délai
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

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
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

					<div
						className={`border-2 border-dashed rounded-md p-6 text-center ${
							files.length > 0
								? "border-primary bg-primary/5"
								: "border-gray-300"
						}`}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					>
						{files.length > 0 ? (
							<div className="space-y-2">
								<div className="flex items-center justify-center gap-2">
									<CheckCircle className="h-5 w-5 text-green-600" />
									<span className="font-medium">
										{files.length} fichier(s) sélectionné(s)
									</span>
								</div>
								<div className="text-sm text-muted-foreground">
									{files.map((file) => file.name).join(", ")}
								</div>
							</div>
						) : (
							<div className="space-y-2">
								<Upload className="h-8 w-8 mx-auto text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									Glissez-déposez vos fichiers Unity ici ou
								</p>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										fileInputRef.current?.click()
									}
								>
									Parcourir
								</Button>
							</div>
						)}
						<input
							ref={fileInputRef}
							type="file"
							multiple
							onChange={handleFileChange}
							className="hidden"
							accept=".zip,.unitypackage"
						/>
					</div>

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
						<Button type="submit" disabled={uploading || success}>
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
