//app/formations/[id]/content/3d/[buildId]/modules/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ArrowLeft, Save, FileUp, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import ModuleManager from "@/components/formations/currentFormation/3d/ModuleManager";
import ObjectMapping from "@/components/formations/currentFormation/3d/ObjectMapping";
import useBuild3DModules from "@/lib/hooks/formations/currentFormation/3d/useBuild3DModules";

export default function BuildModulesPage() {
  const params = useParams();
  const router = useRouter();
  const [build, setBuild] = useState(null);
  const [buildLoading, setBuildLoading] = useState(true);
  const [buildError, setBuildError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("modules");
  
  // Utiliser notre hook pour récupérer et gérer les modules et le mapping
  const { 
    modules, 
    objectMapping, 
    isLoading: modulesLoading, 
    error: modulesError, 
    isSaving, 
    saveModules, 
    saveMapping,
    refresh 
  } = useBuild3DModules(params.id, params.buildId);

  // Charger les détails du build
  useEffect(() => {
    async function fetchBuildDetails() {
      try {
        setBuildLoading(true);
        
        // Récupérer les détails du build
        const buildResponse = await fetch(`/api/formations/${params.id}/content/3d/${params.buildId}`);
        
        if (!buildResponse.ok) {
          throw new Error("Erreur lors du chargement des détails du build");
        }
        
        const buildData = await buildResponse.json();
        setBuild(buildData.build);
      } catch (err) {
        console.error("Erreur:", err);
        setBuildError(err.message);
      } finally {
        setBuildLoading(false);
      }
    }
    
    fetchBuildDetails();
  }, [params.id, params.buildId]);

  const handleBack = () => {
    // Retourner directement à la page de la formation
    router.push(`/formations/${params.id}`);
  };

  // Sauvegarder les modules en utilisant le hook
  const handleSaveModules = async (updatedModules) => {
    try {
      setSuccess(null);
      
      // Utiliser le hook pour sauvegarder
      await saveModules(updatedModules);
      
      setSuccess("Modules sauvegardés avec succès !");
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des modules:", err);
    }
  };

  // Sauvegarder le mapping en utilisant le hook
  const handleSaveMapping = async (updatedMapping) => {
    try {
      setSuccess(null);
      
      // Utiliser le hook pour sauvegarder
      await saveMapping(updatedMapping);
      
      setSuccess("Mapping sauvegardé avec succès !");
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du mapping:", err);
    }
  };

  // Gérer l'état de chargement combiné
  const isLoading = modulesLoading || buildLoading;
  const error = modulesError || buildError;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error && !build) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au build
          </Button>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la formation
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                // Créer un objet avec les données à exporter
                const exportData = {
                  modules: modules,
                  objectMapping: objectMapping
                };
                
                // Convertir en JSON avec indentation pour lisibilité
                const jsonData = JSON.stringify(exportData, null, 2);
                
                // Créer un Blob et un lien de téléchargement
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // Créer un élément a temporaire pour déclencher le téléchargement
                const a = document.createElement('a');
                a.href = url;
                a.download = `config_${build?.name || 'build'}_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                
                // Libérer l'URL
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Importer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Importer une configuration</DialogTitle>
                  <DialogDescription>
                    Importez le mapping et les modules depuis un fichier JSON ou choisissez un modèle prédéfini
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="file" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">Fichier JSON</TabsTrigger>
                    <TabsTrigger value="template">Modèle prédéfini</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="mt-4">
                    <div className="grid gap-4 py-2">
                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm mb-2">
                          Glisser-déposer ou cliquer pour sélectionner un fichier JSON
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Le fichier doit contenir les propriétés "modules" et/ou "objectMapping"
                        </p>
                        <input
                          id="config-file"
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const jsonData = JSON.parse(event.target.result);
                                
                                // Importer le mapping
                                if (jsonData.objectMapping) {
                                  saveMapping(jsonData.objectMapping);
                                }
                                
                                // Importer les modules
                                if (jsonData.modules && jsonData.modules.length > 0) {
                                  // Vérifier et ajuster le type de chaque module selon ses propriétés
                                  const processedModules = jsonData.modules.map(module => {
                                    let moduleType = module.type || "guide";
                                    
                                    // Si le module a des questions, c'est un quiz
                                    if (Array.isArray(module.questions) && module.questions.length > 0) {
                                      moduleType = "quiz";
                                    }
                                    
                                    return {
                                      ...module,
                                      type: moduleType
                                    };
                                  });
                                  
                                  saveModules(processedModules);
                                }
                                
                                // Afficher un message de confirmation
                                setSuccess("Configuration importée avec succès");
                                setTimeout(() => setSuccess(null), 3000);
                                
                                // Fermer la boîte de dialogue après l'importation
                                document.querySelector("[data-state='open'] button[type='button']").click();
                              } catch (error) {
                                console.error("Erreur lors de l'analyse du fichier JSON:", error);
                                alert("Le fichier n'est pas un JSON valide");
                              }
                            };
                            reader.readAsText(file);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById("config-file").click()}
                        >
                          Sélectionner un fichier
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        Cette fonctionnalité remplacera la configuration actuelle des modules et du mapping par celle du fichier JSON importé.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="template" className="mt-4">
                    <div className="grid gap-4 py-2">
                      <Select
                        onValueChange={(value) => {
                          if (value === "custom") return;
                          
                          // Charger les données depuis un fichier JSON prédéfini
                          fetch(`/data/${value}.json`)
                            .then(res => res.json())
                            .then(data => {
                              // Importer le mapping
                              if (data.objectMapping) {
                                saveMapping(data.objectMapping);
                              }
                              
                              // Importer les modules
                              if (data.modules && data.modules.length > 0) {
                                // Vérifier et ajuster le type de chaque module selon ses propriétés
                                const processedModules = data.modules.map(module => {
                                  let moduleType = module.type || "guide";
                                  
                                  // Si le module a des questions, c'est un quiz
                                  if (Array.isArray(module.questions) && module.questions.length > 0) {
                                    moduleType = "quiz";
                                    console.log(`Module prédéfini ${module.id} détecté comme quiz avec ${module.questions.length} questions`);
                                  }
                                  
                                  return {
                                    ...module,
                                    type: moduleType
                                  };
                                });
                                
                                saveModules(processedModules);
                              }
                              
                              // Afficher un message de confirmation
                              setSuccess("Configuration importée avec succès");
                              setTimeout(() => setSuccess(null), 3000);
                              
                              // Fermer la boîte de dialogue après l'importation
                              document.querySelector("[data-state='open'] button[type='button']").click();
                            })
                            .catch(err => {
                              console.error("Erreur lors du chargement du fichier JSON:", err);
                              alert("Erreur lors du chargement du modèle");
                            });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un modèle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOTO_Acces_Zone_Robot">Procédure LOTO - Accès Zone Robot</SelectItem>
                          <SelectItem value="WiseTrainer_01">Formation Sécurité Industrielle</SelectItem>
                          <SelectItem value="WiseTrainer_ZoneLogistique-Cariste">Formation Zone Logistique - Cariste</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        Cette fonctionnalité remplacera la configuration actuelle des modules et du mapping par celle du modèle sélectionné.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold">
          Configuration du cours 3D : {build?.name}
        </h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
            <Save className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <Tabs 
          defaultValue="modules" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Modules d'apprentissage</TabsTrigger>
            <TabsTrigger value="mapping">Mapping des objets 3D</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="mt-6">
            <ModuleManager 
              build3D={{ ...build, modules }} 
              onModulesSave={handleSaveModules}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="mapping" className="mt-6">
            <ObjectMapping 
              build3D={{ ...build, objectMapping, modules }} 
              onMappingSave={handleSaveMapping}
              isSaving={isSaving}
              availableModules={modules}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}