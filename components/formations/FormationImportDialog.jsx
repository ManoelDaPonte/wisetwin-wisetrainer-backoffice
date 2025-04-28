// components/formations/FormationImportDialog.jsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
	Upload,
	X,
	CheckCircle,
	AlertCircle,
	Loader2,
	Edit,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function FormationImportDialog({
	open,
	onOpenChange,
	onSuccess,
}) {
	const router = useRouter();
	const [file, setFile] = useState(null);
	const [fileContent, setFileContent] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState(null);
	const [importSuccess, setImportSuccess] = useState(false);
	const [importedId, setImportedId] = useState(null);
	const fileInputRef = useRef(null);

	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];
		setError(null);
		setImportSuccess(false);

		if (!selectedFile) {
			return;
		}

		if (
			selectedFile.type !== "application/json" &&
			!selectedFile.name.endsWith(".json")
		) {
			setError("Veuillez sélectionner un fichier JSON valide");
			event.target.value = null;
			return;
		}

		setFile(selectedFile);

		// Lire le contenu du fichier
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = JSON.parse(e.target.result);
				setFileContent(content);
			} catch (err) {
				setError("Le fichier n'est pas un JSON valide");
				setFile(null);
				setFileContent(null);
			}
		};
		reader.readAsText(selectedFile);
	};

	const handleImport = async () => {
		if (!fileContent) {
			setError("Aucun fichier valide sélectionné");
			return;
		}

		setIsUploading(true);
		setError(null);

		try {
			const response = await fetch("/api/formations/import", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ formation: fileContent }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Erreur lors de l'importation"
				);
			}

			const result = await response.json();
			setImportSuccess(true);
			setImportedId(result.id);

			// Notifier le parent du succès de l'importation
			if (onSuccess) {
				onSuccess();
			}
		} catch (err) {
			console.error("Erreur:", err);
			setError(
				err.message || "Une erreur est survenue lors de l'importation"
			);
		} finally {
			setIsUploading(false);
		}
	};

	const resetForm = () => {
		setFile(null);
		setFileContent(null);
		setError(null);
		setImportSuccess(false);
		setImportedId(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = null;
		}
	};

	const handleClose = () => {
		if (importSuccess) {
			// Rafraîchir la page formations après une importation réussie
			router.refresh();
		}
		resetForm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Importer une formation</DialogTitle>
					<DialogDescription>
						Importez une formation à partir d'un fichier JSON
					</DialogDescription>
				</DialogHeader>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{importSuccess && (
					<Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
						<CheckCircle className="h-4 w-4" />
						<AlertDescription>
							Formation importée avec succès!
						</AlertDescription>
					</Alert>
				)}

				<div className="space-y-4">
					{!importSuccess && (
						<div
							className={`border-2 border-dashed rounded-md p-6 text-center ${
								file
									? "border-primary bg-primary/5"
									: "border-gray-300"
							}`}
							onDragOver={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onDrop={(e) => {
								e.preventDefault();
								e.stopPropagation();

								const droppedFile = e.dataTransfer.files[0];
								if (droppedFile) {
									// Simuler un changement de fichier pour utiliser la même logique
									const fakeEvent = {
										target: { files: [droppedFile] },
									};
									handleFileChange(fakeEvent);
								}
							}}
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
											onClick={() => {
												setFile(null);
												setFileContent(null);
												if (fileInputRef.current) {
													fileInputRef.current.value =
														null;
												}
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							) : (
								<div className="space-y-2">
									<Upload className="h-8 w-8 mx-auto text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										Glissez-déposez un fichier JSON de
										formation ou
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
								accept=".json,application/json"
								onChange={handleFileChange}
								className="hidden"
							/>
						</div>
					)}

					{fileContent && !importSuccess && (
						<div className="p-4 border rounded-md bg-background">
							<h3 className="font-medium mb-2">
								Détails de la formation:
							</h3>
							<div className="space-y-2">
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline">
										{fileContent.category || "Non spécifié"}
									</Badge>
									<Badge variant="outline">
										{fileContent.difficulty ||
											"Non spécifié"}
									</Badge>
									<Badge variant="outline">
										{fileContent.duration || "Non spécifié"}
									</Badge>
								</div>
								<p>
									<span className="font-medium">Nom:</span>{" "}
									{fileContent.name || "Non spécifié"}
								</p>
								<p>
									<span className="font-medium">ID:</span>{" "}
									{fileContent.id || "Non spécifié"}
								</p>
								<p>
									<span className="font-medium">
										Description:
									</span>{" "}
									{fileContent.description || "Non spécifié"}
								</p>
								<p>
									<span className="font-medium">
										Modules:
									</span>{" "}
									{fileContent.modules?.length || 0}
								</p>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="flex justify-between">
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isUploading}
					>
						{importSuccess ? "Fermer" : "Annuler"}
					</Button>

					{importSuccess ? (
						<Button
							onClick={() =>
								router.push(`/formations/edit/${importedId}`)
							}
						>
							<Edit className="mr-2 h-4 w-4" />
							Modifier la formation
						</Button>
					) : (
						<Button
							onClick={handleImport}
							disabled={!fileContent || isUploading}
						>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Importation...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Importer
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
