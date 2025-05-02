//components/formations/currentFormation/3d/ObjectMapping.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	PlusCircle,
	Trash2,
	Save,
	Box,
	Code,
	RefreshCw,
	Loader2,
	Check,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function ObjectMapping({
	build3D,
	onMappingSave,
	isSaving = false,
	availableModules = [],
}) {
	const [objectMapping, setObjectMapping] = useState(build3D?.objectMapping || {});
	const [newObjectKey, setNewObjectKey] = useState("");
	const [newObjectValue, setNewObjectValue] = useState("");
	const [error, setError] = useState(null);
	const [jsonMode, setJsonMode] = useState(false);
	const [jsonText, setJsonText] = useState("");
	const [modules, setModules] = useState(build3D?.modules || availableModules || []);
	const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'saved', 'error'
	
	// Calcule quels modules sont déjà mappés
	const mappedModuleIds = Object.values(objectMapping);
	const unmappedModules = modules.filter(module => !mappedModuleIds.includes(module.id));

	useEffect(() => {
		// Initialiser le texte JSON
		setJsonText(JSON.stringify(objectMapping, null, 2));
	}, [objectMapping]);

	// Ajouter ou mettre à jour un mapping et sauvegarder en base de données
	const handleAddMapping = async () => {
		if (!newObjectKey.trim()) {
			setError("Le nom de l'objet Unity est requis");
			return;
		}

		if (!newObjectValue.trim()) {
			setError("L'ID du module est requis");
			return;
		}

		const updatedMapping = {
			...objectMapping,
			[newObjectKey]: newObjectValue,
		};
		
		setSaveStatus('saving');
		
		try {
			// Sauvegarder directement en base de données
			if (onMappingSave) {
				await onMappingSave(updatedMapping);
				
				// Mise à jour réussie - mettre à jour l'état local
				setObjectMapping(updatedMapping);
				setSaveStatus('saved');
				setTimeout(() => setSaveStatus(null), 3000);
				
				// Réinitialiser les champs
				setNewObjectKey("");
				setNewObjectValue("");
				setError(null);
			}
		} catch (error) {
			console.error("Erreur lors de l'ajout du mapping en base de données:", error);
			setError("Erreur lors de la sauvegarde du mapping. Veuillez réessayer.");
			setSaveStatus('error');
			setTimeout(() => setSaveStatus(null), 3000);
		}
	};

	// Supprimer un mapping et sauvegarder en base de données
	const handleDeleteMapping = async (key) => {
		const newMapping = { ...objectMapping };
		delete newMapping[key];
		
		setSaveStatus('saving');
		
		try {
			// Sauvegarder directement en base de données
			if (onMappingSave) {
				await onMappingSave(newMapping);
				
				// Mise à jour réussie - mettre à jour l'état local
				setObjectMapping(newMapping);
				setSaveStatus('saved');
				setTimeout(() => setSaveStatus(null), 3000);
			}
		} catch (error) {
			console.error("Erreur lors de la suppression du mapping en base de données:", error);
			setError("Erreur lors de la suppression du mapping. Veuillez réessayer.");
			setSaveStatus('error');
			setTimeout(() => setSaveStatus(null), 3000);
		}
	};

	// Sauvegarder le JSON en mode texte et en base de données
	const handleSaveJsonText = async () => {
		try {
			const parsed = JSON.parse(jsonText);
			
			setSaveStatus('saving');
			
			// Sauvegarder directement en base de données
			if (onMappingSave) {
				await onMappingSave(parsed);
				
				// Mise à jour réussie - mettre à jour l'état local
				setObjectMapping(parsed);
				setError(null);
				setJsonMode(false);
				setSaveStatus('saved');
				setTimeout(() => setSaveStatus(null), 3000);
			}
		} catch (err) {
			setError("JSON invalide: " + err.message);
			setSaveStatus('error');
			setTimeout(() => setSaveStatus(null), 3000);
		}
	};

	// Enregistrer tous les mappings manuellement
	const handleSaveAllMappings = () => {
		setSaveStatus('saving');
		onMappingSave(objectMapping)
			.then(() => {
				console.log("Sauvegarde manuelle du mapping réussie");
				setSaveStatus('saved');
				setTimeout(() => setSaveStatus(null), 3000);
			})
			.catch((error) => {
				console.error("Erreur lors de la sauvegarde manuelle du mapping:", error);
				setSaveStatus('error');
				setTimeout(() => setSaveStatus(null), 3000);
			});
	};

	// Trouver le nom du module à partir de son ID
	const getModuleName = (moduleId) => {
		const module = modules.find(m => m.id === moduleId);
		return module ? module.title : moduleId;
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
				<div className="flex items-center">
					<h2 className="text-xl font-semibold">Mapping des objets 3D</h2>
					{saveStatus && (
						<div className="ml-3 flex items-center">
							{saveStatus === 'saving' && (
								<Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center">
									<RefreshCw className="h-3 w-3 mr-1 animate-spin" />
									Sauvegarde en cours...
								</Badge>
							)}
							{saveStatus === 'saved' && (
								<Badge variant="outline" className="bg-green-50 text-green-700 flex items-center">
									<CheckCircle2 className="h-3 w-3 mr-1" />
									Sauvegardé
								</Badge>
							)}
							{saveStatus === 'error' && (
								<Badge variant="outline" className="bg-red-50 text-red-700 flex items-center">
									<AlertCircle className="h-3 w-3 mr-1" />
									Erreur de sauvegarde
								</Badge>
							)}
						</div>
					)}
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						onClick={() => setJsonMode(!jsonMode)}
					>
						<Code className="mr-2 h-4 w-4" />
						{jsonMode ? "Mode visuel" : "Mode JSON"}
					</Button>
				</div>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			
			{modules.length === 0 && (
				<Alert className="bg-amber-50 border-amber-200 text-amber-800">
					<AlertCircle className="h-4 w-4 mr-2" />
					<AlertDescription>
						Aucun module n'a encore été créé. Veuillez d'abord ajouter des modules pour pouvoir les mapper à des objets 3D.
					</AlertDescription>
				</Alert>
			)}

			{jsonMode ? (
				<Card>
					<CardHeader>
						<CardTitle>
							Édition directe du JSON de mapping
						</CardTitle>
						<CardDescription>
							Modifiez directement le JSON de mapping des objets.
							Format: {"{"}"nom_objet_unity": "id_module"{"}"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							value={jsonText}
							onChange={(e) => setJsonText(e.target.value)}
							rows={10}
							className="font-mono"
						/>
						<div className="flex justify-end mt-4">
							<Button
								variant="outline"
								onClick={() => {
									setJsonText(
										JSON.stringify(objectMapping, null, 2)
									);
									setError(null);
								}}
								className="mr-2"
							>
								<RefreshCw className="mr-2 h-4 w-4" />
								Réinitialiser
							</Button>
							<Button onClick={handleSaveJsonText}>
								<Save className="mr-2 h-4 w-4" />
								Appliquer
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle>Ajouter un nouveau mapping</CardTitle>
							<CardDescription>
								Associez un objet 3D de Unity à un module
								spécifique dans votre cours
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="objectKey">
										Nom de l'objet Unity
									</Label>
									<Input
										id="objectKey"
										value={newObjectKey}
										onChange={(e) =>
											setNewObjectKey(e.target.value)
										}
										placeholder="ex: Kuka, ArguingWorker, Controller_circleIcon"
									/>
								</div>
								<div>
									<Label htmlFor="objectValue">
										Module associé
									</Label>
									<Select
										value={newObjectValue}
										onValueChange={setNewObjectValue}
									>
										<SelectTrigger>
											<SelectValue placeholder="Sélectionner un module" />
										</SelectTrigger>
										<SelectContent>
											{modules.map((module) => (
												<SelectItem key={module.id} value={module.id}>
													<div className="flex items-center justify-between w-full">
														<span className="mr-2">{module.title || module.id}</span>
														{mappedModuleIds.includes(module.id) ? (
															<Badge variant="outline" className="ml-2 bg-green-100 text-green-600">
																<Check className="h-3 w-3 mr-1" />
																Mappé
															</Badge>
														) : (
															<Badge variant="outline" className="ml-2 bg-amber-100 text-amber-600">
																Non mappé
															</Badge>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<Button 
								onClick={handleAddMapping} 
								className="mt-4"
								disabled={modules.length === 0}
							>
								<PlusCircle className="mr-2 h-4 w-4" />
								Ajouter ce mapping
							</Button>
						</CardContent>
					</Card>

					{unmappedModules.length > 0 && (
						<Card className="border-amber-200 bg-amber-50/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-base flex items-center">
									<AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
									Modules non mappés
								</CardTitle>
								<CardDescription>
									Ces modules n'ont pas encore été associés à des objets 3D dans Unity
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
									{unmappedModules.map((module) => (
										<Card key={module.id} className="border-amber-200 bg-amber-50/30">
											<CardHeader className="p-3 pb-2">
												<CardTitle className="text-sm">{module.title || module.id}</CardTitle>
											</CardHeader>
											<CardContent className="p-3 pt-0">
												<p className="text-xs text-muted-foreground truncate">
													{module.description || "Aucune description"}
												</p>
											</CardContent>
											<CardFooter className="p-3 pt-0 flex justify-end">
												<Button 
													size="sm" 
													variant="outline"
													onClick={() => {
														setNewObjectKey("");
														setNewObjectValue(module.id);
													}}
												>
													Mapper ce module
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Mappings existants</CardTitle>
							<CardDescription>
								Liste des associations entre objets Unity et
								modules
							</CardDescription>
						</CardHeader>
						<CardContent>
							{Object.keys(objectMapping).length === 0 ? (
								<div className="text-center py-6 text-muted-foreground">
									<Box className="h-12 w-12 mx-auto mb-2" />
									<p>Aucun mapping d'objets défini</p>
									<p className="text-sm">
										Ajoutez un premier mapping à l'aide du
										formulaire ci-dessus
									</p>
								</div>
							) : (
								<div className="border rounded-md overflow-hidden">
									<table className="w-full">
										<thead>
											<tr className="bg-muted">
												<th className="text-left p-3 font-medium">
													Objet Unity
												</th>
												<th className="text-left p-3 font-medium">
													Module
												</th>
												<th className="text-right p-3 w-20">
													Actions
												</th>
											</tr>
										</thead>
										<tbody>
											{Object.entries(objectMapping).map(
												([key, value]) => (
													<tr
														key={key}
														className="border-t"
													>
														<td className="p-3 font-mono text-sm">
															{key}
														</td>
														<td className="p-3 text-sm">
															<div className="flex items-center">
																<span className="font-medium mr-2">{getModuleName(value)}</span>
																<span className="text-xs text-muted-foreground font-mono">({value})</span>
															</div>
														</td>
														<td className="p-3 text-right">
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	handleDeleteMapping(
																		key
																	)
																}
															>
																<Trash2 className="h-4 w-4 text-destructive" />
															</Button>
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}