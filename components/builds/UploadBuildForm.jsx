import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadBuildForm({ onClose, onSuccess }) {
	const [file, setFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		version: "1.0",
		description: "",
		container: "builds", // Container par défaut
	});
	const fileInputRef = useRef(null);

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (
			selectedFile &&
			(selectedFile.type === "application/zip" ||
				selectedFile.name.endsWith(".zip"))
		) {
			setFile(selectedFile);
			// Mise à jour automatique du nom si vide
			if (!formData.name) {
				setFormData({
					...formData,
					name: selectedFile.name.replace(".zip", ""),
				});
			}
		} else {
			setError("Veuillez sélectionner un fichier ZIP valide");
			e.target.value = null;
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const droppedFile = e.dataTransfer.files[0];
		if (
			droppedFile &&
			(droppedFile.type === "application/zip" ||
				droppedFile.name.endsWith(".zip"))
		) {
			setFile(droppedFile);
			// Mise à jour automatique du nom si vide
			if (!formData.name) {
				setFormData({
					...formData,
					name: droppedFile.name.replace(".zip", ""),
				});
			}
		} else {
			setError("Veuillez déposer un fichier ZIP valide");
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!file) {
			setError("Veuillez sélectionner un fichier");
			return;
		}

		if (!formData.name || !formData.version) {
			setError("Le nom et la version sont requis");
			return;
		}

		setError(null);
		setUploading(true);

		// Création d'un lecteur de fichier pour simuler la progression
		const reader = new FileReader();
		reader.onprogress = (event) => {
			if (event.lengthComputable) {
				const progress = Math.round((event.loaded / event.total) * 50); // 50% pour la lecture
				setUploadProgress(progress);
			}
		};

		reader.onload = async () => {
			try {
				// Préparation des données pour l'upload
				const formDataToSend = new FormData();
				formDataToSend.append("file", file);
				formDataToSend.append("name", formData.name);
				formDataToSend.append("version", formData.version);
				formDataToSend.append("description", formData.description);
				formDataToSend.append("container", formData.container);

				// Simulation de progression d'upload
				const uploadInterval = setInterval(() => {
					setUploadProgress((prev) => {
						const newProgress = prev + 1;
						if (newProgress >= 98) clearInterval(uploadInterval);
						return Math.min(newProgress, 98);
					});
				}, 200);

				// Requête d'upload
				const response = await fetch("/api/builds/upload", {
					method: "POST",
					body: formDataToSend,
				});

				clearInterval(uploadInterval);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(
						errorData.error || "Erreur lors de l'upload"
					);
				}

				const result = await response.json();
				setUploadProgress(100);
				setSuccess(true);

				// Notifier le composant parent du succès
				if (onSuccess) {
					setTimeout(() => {
						onSuccess(result.build);
					}, 1500);
				}
			} catch (err) {
				console.error("Erreur lors de l'upload:", err);
				setError(
					err.message || "Une erreur est survenue lors de l'upload"
				);
				setUploadProgress(0);
			} finally {
				setUploading(false);
			}
		};

		// Simuler la lecture du fichier pour montrer la progression
		reader.readAsArrayBuffer(file);
	};

	const resetForm = () => {
		setFile(null);
		setUploadProgress(0);
		setError(null);
		setSuccess(false);
		setFormData({
			name: "",
			version: "1.0",
			description: "",
			container: "builds",
		});
		if (fileInputRef.current) {
			fileInputRef.current.value = null;
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Uploader un build Unity</CardTitle>
				<CardDescription>
					Sélectionnez un fichier ZIP contenant votre build WebGL
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit}>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success && (
						<Alert className="mb-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
							<CheckCircle className="h-4 w-4" />
							<AlertDescription>
								Build uploadé avec succès!
							</AlertDescription>
						</Alert>
					)}

					<div className="space-y-4">
						<div
							className={`border-2 border-dashed rounded-md p-6 text-center ${
								file
									? "border-primary bg-primary/5"
									: "border-gray-300"
							}`}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							{file ? (
								<div className="space-y-2">
									<div className="flex items-center justify-center gap-2">
										<CheckCircle className="h-5 w-5 text-green-600" />
										<span className="font-medium">
											Fichier sélectionné
										</span>
									</div>
									<div className="flex items-center justify-between p-2 border rounded-md bg-background">
										<span className="truncate max-w-[200px]">
											{file.name}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => setFile(null)}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							) : (
								<div className="space-y-2">
									<Upload className="h-8 w-8 mx-auto text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										Glissez-déposez votre fichier ZIP ici ou
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
								accept=".zip"
								onChange={handleFileChange}
								className="hidden"
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

							<div>
								<Label htmlFor="container">
									Container Azure
								</Label>
								<Input
									id="container"
									name="container"
									value={formData.container}
									onChange={handleInputChange}
									required
									disabled={uploading}
								/>
							</div>
						</div>

						{uploading && (
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Upload en cours...</span>
									<span>{uploadProgress}%</span>
								</div>
								<Progress
									value={uploadProgress}
									className="h-2"
								/>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-3 mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={success ? resetForm : onClose}
							disabled={uploading}
						>
							{success ? "Nouveau upload" : "Annuler"}
						</Button>
						<Button
							type="submit"
							disabled={uploading || success || !file}
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
			</CardContent>
		</Card>
	);
}
