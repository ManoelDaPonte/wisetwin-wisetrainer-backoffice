//components/formations/currentFormation/3d/ModuleManager.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  PlusCircle, 
  Trash2, 
  Save, 
  FileUp, 
  Pencil, 
  Loader2,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MODULE_TYPES = [
  { value: "guide", label: "Guide pas à pas" },
  { value: "quiz", label: "Questionnaire interactif" }
];

const DEFAULT_MODULE = {
  id: "",
  order: 1,
  title: "",
  description: "",
  type: "guide",
  // Contenu éducatif (optionnel pour tous les types de modules)
  educational: {
    title: "",
    content: {
      intro: "",
      sections: []
    },
    imageUrl: ""
  },
  // Propriétés spécifiques pour les guides
  sequenceButtons: [],
  steps: [],
  // Propriétés spécifiques pour les questionnaires
  questions: []
};

export default function ModuleManager({ build3D, onModulesSave, isSaving = false }) {
  const [modules, setModules] = useState(build3D?.modules || []);
  const [currentModule, setCurrentModule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'saved', 'error'
  
  // Pour assigner un ordre par défaut aux nouveaux modules
  const getNextOrder = () => {
    if (modules.length === 0) return 1;
    return Math.max(...modules.map(m => m.order)) + 1;
  };
  
  // Créer un nouveau module
  const handleAddModule = () => {
    const newModule = {
      ...DEFAULT_MODULE,
      id: `module-${Date.now()}`,
      order: getNextOrder()
    };
    
    setCurrentModule(newModule);
    setIsEditing(true);
  };
  
  // Éditer un module existant
  const handleEditModule = (module) => {
    console.log("Editing module:", module);
    
    // Déterminer le type de module basé sur les données
    let moduleType = module.type || "guide";
    
    // Si le module a des questions, c'est un quiz
    if (Array.isArray(module.questions) && module.questions.length > 0) {
      moduleType = "quiz";
    }
    
    console.log(`Module ${module.id}: detected type=${moduleType}, has questions: ${Array.isArray(module.questions) && module.questions.length > 0}`);
    
    // S'assurer que toutes les propriétés nécessaires sont initialisées
    const preparedModule = {
      ...DEFAULT_MODULE,
      ...module,
      type: moduleType, // Utiliser le type détecté
      educational: {
        ...DEFAULT_MODULE.educational,
        ...(module.educational || {}),
        content: {
          ...DEFAULT_MODULE.educational.content,
          ...(module.educational?.content || {})
        }
      },
      // Assurer que questions est toujours un tableau
      questions: Array.isArray(module.questions) ? module.questions : [],
      // Assurer que steps est toujours un tableau
      steps: Array.isArray(module.steps) ? module.steps : [],
      // Assurer que sequenceButtons est toujours un tableau
      sequenceButtons: Array.isArray(module.sequenceButtons) ? module.sequenceButtons : []
    };
    
    setCurrentModule(preparedModule);
    setIsEditing(true);
  };
  
  // Supprimer un module et sauvegarder en base de données
  const handleDeleteModule = async (moduleId) => {
    const updatedModules = modules.filter(m => m.id !== moduleId);
    
    setSaveStatus('saving');
    
    try {
      // Sauvegarder directement en base de données
      if (onModulesSave) {
        await onModulesSave(updatedModules);
        
        // Mise à jour réussie - mettre à jour l'état local
        setModules(updatedModules);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du module en base de données:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };
  
  // Mettre à jour le module en cours d'édition
  const handleUpdateModule = (field, value) => {
    setCurrentModule(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Mettre à jour les champs imbriqués (educational)
  const handleUpdateEducational = (field, value) => {
    setCurrentModule(prev => ({
      ...prev,
      educational: {
        ...(prev.educational || {}),
        [field]: value
      }
    }));
  };
  
  // Sauvegarder le module en cours d'édition et l'enregistrer en base de données
  const handleSaveModule = async () => {
    // Validation
    if (!currentModule.title) {
      setErrorMessage("Le titre du module est requis");
      return;
    }
    
    // Vérifier si c'est un nouveau module ou une mise à jour
    const moduleIndex = modules.findIndex(m => m.id === currentModule.id);
    let updatedModules;
    
    if (moduleIndex === -1) {
      // Nouveau module
      updatedModules = [...modules, currentModule];
    } else {
      // Mise à jour d'un module existant
      updatedModules = [...modules];
      updatedModules[moduleIndex] = currentModule;
    }
    
    setSaveStatus('saving');
    
    try {
      // Sauvegarder directement en base de données
      if (onModulesSave) {
        await onModulesSave(updatedModules);
        
        // Mise à jour réussie - mettre à jour l'état local
        setModules(updatedModules);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
        
        // Réinitialiser
        setCurrentModule(null);
        setIsEditing(false);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du module en base de données:", error);
      setErrorMessage("Erreur lors de la sauvegarde du module. Veuillez réessayer.");
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };
  
  // Sauvegarder tous les modules manuellement
  const handleSaveAllModules = () => {
    setSaveStatus('saving');
    onModulesSave(modules)
      .then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
      })
      .catch((error) => {
        console.error("Erreur lors de la sauvegarde manuelle des modules:", error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      });
  };
  
  // Réordonner les modules et sauvegarder en base de données
  const handleMoveModule = async (moduleId, direction) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (
      (direction === "up" && moduleIndex === 0) || 
      (direction === "down" && moduleIndex === modules.length - 1)
    ) {
      return;
    }
    
    const newModules = [...modules];
    const moduleToMove = newModules[moduleIndex];
    const targetIndex = direction === "up" ? moduleIndex - 1 : moduleIndex + 1;
    const targetModule = newModules[targetIndex];
    
    // Échanger les ordres
    const tempOrder = moduleToMove.order;
    moduleToMove.order = targetModule.order;
    targetModule.order = tempOrder;
    
    // Réordonner le tableau
    newModules[moduleIndex] = targetModule;
    newModules[targetIndex] = moduleToMove;
    
    setSaveStatus('saving');
    
    try {
      // Sauvegarder directement en base de données
      if (onModulesSave) {
        await onModulesSave(newModules);
        
        // Mise à jour réussie - mettre à jour l'état local
        setModules(newModules);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error("Erreur lors de la réorganisation des modules en base de données:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Modules du cours 3D</h2>
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
          <Button onClick={handleAddModule}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un module
          </Button>
        </div>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun module n'a encore été ajouté à ce cours 3D.
            </p>
            <Button onClick={handleAddModule}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter votre premier module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules
            .sort((a, b) => a.order - b.order)
            .map((module) => (
              <Card key={module.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {module.order}. {module.title}
                        <Badge variant="outline" className="ml-2">
                          {MODULE_TYPES.find(t => t.value === module.type)?.label || module.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMoveModule(module.id, "up")}
                        disabled={module.order === 1}
                      >
                        ↑
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMoveModule(module.id, "down")}
                        disabled={module.order === modules.length}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditModule(module)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Supprimer le module</DialogTitle>
                            <DialogDescription>
                              Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              Supprimer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="flex flex-wrap gap-4">
                      {module.educational?.title && (
                        <div>
                          <span className="text-muted-foreground">Contenu éducatif:</span> {module.educational.title}
                        </div>
                      )}
                      
                      {module.type === "guide" && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Étapes:</span> {module.steps?.length || 0}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Boutons:</span> {module.sequenceButtons?.length || 0}
                          </div>
                        </>
                      )}
                      
                      {module.type === "quiz" && (
                        <div>
                          <span className="text-muted-foreground">Questions:</span> {module.questions?.length || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Dialogue d'édition de module */}
      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentModule?.id?.startsWith('module-') ? 'Ajouter un module' : 'Modifier le module'}
            </DialogTitle>
          </DialogHeader>
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {currentModule && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Label htmlFor="title">Titre du module</Label>
                  <Input
                    id="title"
                    value={currentModule.title || ""}
                    onChange={(e) => handleUpdateModule('title', e.target.value)}
                    placeholder="ex: Procédure d'accès à la zone robot"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order">Ordre</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={currentModule.order || 1}
                    onChange={(e) => handleUpdateModule('order', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentModule.description || ""}
                  onChange={(e) => handleUpdateModule('description', e.target.value)}
                  placeholder="Courte description du module"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type de module</Label>
                  <Select
                    value={currentModule.type || "guide"}
                    onValueChange={(value) => {
                      // Réinitialiser les propriétés spécifiques au type
                      const resetModule = {
                        ...currentModule,
                        type: value
                      };
                      
                      // Réinitialiser les propriétés spécifiques au type précédent
                      if (currentModule.type === "guide" && value !== "guide") {
                        resetModule.sequenceButtons = [];
                        resetModule.steps = [];
                      }
                      
                      if (currentModule.type === "quiz" && value !== "quiz") {
                        resetModule.questions = [];
                      }
                      
                      // Initialiser les propriétés du nouveau type
                      if (value === "guide" && (!resetModule.steps || resetModule.steps.length === 0)) {
                        resetModule.sequenceButtons = [];
                        resetModule.steps = [];
                      }
                      
                      if (value === "quiz" && (!resetModule.questions || resetModule.questions.length === 0)) {
                        resetModule.questions = [{
                          id: "question-1",
                          text: "",
                          type: "SINGLE",
                          options: [
                            { id: "q1-o1", text: "", isCorrect: false },
                            { id: "q1-o2", text: "", isCorrect: false }
                          ]
                        }];
                      }
                      
                      setCurrentModule(resetModule);
                    }}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODULE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Contenu éducatif</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="educationalTitle">Titre du contenu</Label>
                    <Input
                      id="educationalTitle"
                      value={currentModule.educational?.title || ""}
                      onChange={(e) => handleUpdateEducational('title', e.target.value)}
                      placeholder="ex: Comprendre les procédures de consignation"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="educationalIntro">Introduction</Label>
                    <Textarea
                      id="educationalIntro"
                      value={currentModule.educational?.content?.intro || ""}
                      onChange={(e) => {
                        const content = currentModule.educational?.content || {};
                        setCurrentModule(prev => ({
                          ...prev,
                          educational: {
                            ...prev.educational,
                            content: {
                              ...content,
                              intro: e.target.value
                            }
                          }
                        }));
                      }}
                      placeholder="Introduction au contenu éducatif"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">URL de l'image (optionnelle)</Label>
                    <Input
                      id="imageUrl"
                      value={currentModule.educational?.imageUrl || ""}
                      onChange={(e) => handleUpdateEducational('imageUrl', e.target.value)}
                      placeholder="ex: /images/wisetrainer/loto-procedure.png"
                    />
                  </div>
                </div>
              </div>
              
              {currentModule.type === "guide" && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Configuration du guide interactif</h3>
                  
                  {/* Séquence de boutons */}
                  <div className="space-y-4 mb-6">
                    <Label htmlFor="sequenceButtons">Séquence de boutons à appuyer (un par ligne)</Label>
                    <Textarea
                      id="sequenceButtons"
                      value={(currentModule.sequenceButtons || []).join('\n')}
                      onChange={(e) => {
                        const buttons = e.target.value.split('\n').filter(btn => btn.trim() !== '');
                        setCurrentModule(prev => ({
                          ...prev,
                          sequenceButtons: buttons
                        }));
                      }}
                      placeholder="Exemple: bouton1&#10;bouton2&#10;bouton3"
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      Ces identifiants doivent correspondre aux noms des objets dans Unity
                    </p>
                  </div>
                  
                  {/* Étapes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Étapes du guide</Label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const steps = [...(currentModule.steps || [])];
                          steps.push({
                            id: `step-${steps.length + 1}`,
                            title: "",
                            instruction: "",
                            validationEvent: "",
                            validationType: "3d",
                            hint: ""
                          });
                          
                          setCurrentModule(prev => ({
                            ...prev,
                            steps
                          }));
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Ajouter une étape
                      </Button>
                    </div>
                    
                    {(currentModule.steps || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-4 text-center">
                        Aucune étape définie. Ajoutez des étapes pour créer votre guide interactif.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {(currentModule.steps || []).map((step, index) => (
                          <Card key={step.id || index} className="border-dashed">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm">Étape {index + 1}</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const steps = [...(currentModule.steps || [])];
                                    steps.splice(index, 1);
                                    setCurrentModule(prev => ({
                                      ...prev,
                                      steps
                                    }));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pb-3">
                              <div>
                                <Label htmlFor={`step-${index}-title`} className="text-xs">Titre</Label>
                                <Input
                                  id={`step-${index}-title`}
                                  value={step.title || ""}
                                  onChange={(e) => {
                                    const steps = [...(currentModule.steps || [])];
                                    steps[index] = { ...steps[index], title: e.target.value };
                                    setCurrentModule(prev => ({ ...prev, steps }));
                                  }}
                                  placeholder="Titre de l'étape"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`step-${index}-instruction`} className="text-xs">Instruction</Label>
                                <Textarea
                                  id={`step-${index}-instruction`}
                                  value={step.instruction || ""}
                                  onChange={(e) => {
                                    const steps = [...(currentModule.steps || [])];
                                    steps[index] = { ...steps[index], instruction: e.target.value };
                                    setCurrentModule(prev => ({ ...prev, steps }));
                                  }}
                                  placeholder="Instruction pour l'utilisateur"
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`step-${index}-event`} className="text-xs">Événement de validation</Label>
                                  <Select
                                    value={step.validationEvent || ""}
                                    onValueChange={(value) => {
                                      const steps = [...(currentModule.steps || [])];
                                      steps[index] = { ...steps[index], validationEvent: value };
                                      setCurrentModule(prev => ({ ...prev, steps }));
                                    }}
                                  >
                                    <SelectTrigger id={`step-${index}-event`} className="mt-1">
                                      <SelectValue placeholder="Sélectionner un bouton" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">-- Aucun --</SelectItem>
                                      {(currentModule.sequenceButtons || []).map((button, i) => (
                                        <SelectItem key={i} value={button}>
                                          {button}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor={`step-${index}-type`} className="text-xs">Type de validation</Label>
                                  <Select
                                    value={step.validationType || "3d"}
                                    onValueChange={(value) => {
                                      const steps = [...(currentModule.steps || [])];
                                      steps[index] = { ...steps[index], validationType: value };
                                      setCurrentModule(prev => ({ ...prev, steps }));
                                    }}
                                  >
                                    <SelectTrigger id={`step-${index}-type`} className="mt-1">
                                      <SelectValue placeholder="Type de validation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="3d">Objet 3D</SelectItem>
                                      <SelectItem value="manual">Manuelle</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`step-${index}-hint`} className="text-xs">Indice (optionnel)</Label>
                                <Input
                                  id={`step-${index}-hint`}
                                  value={step.hint || ""}
                                  onChange={(e) => {
                                    const steps = [...(currentModule.steps || [])];
                                    steps[index] = { ...steps[index], hint: e.target.value };
                                    setCurrentModule(prev => ({ ...prev, steps }));
                                  }}
                                  placeholder="Indice pour aider l'utilisateur"
                                  className="mt-1"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {currentModule.type === "quiz" && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Configuration du questionnaire</h3>
                  
                  {/* Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Questions</Label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const questions = [...(currentModule.questions || [])];
                          questions.push({
                            id: `question-${questions.length + 1}`,
                            text: "",
                            type: "SINGLE",
                            options: [
                              { id: `q${questions.length+1}-o1`, text: "", isCorrect: false },
                              { id: `q${questions.length+1}-o2`, text: "", isCorrect: false }
                            ]
                          });
                          
                          setCurrentModule(prev => ({
                            ...prev,
                            questions
                          }));
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Ajouter une question
                      </Button>
                    </div>
                    
                    {(currentModule.questions || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-4 text-center">
                        Aucune question définie. Ajoutez des questions pour créer votre questionnaire.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {(currentModule.questions || []).map((question, qIndex) => (
                          <Card key={question.id || qIndex} className="border-dashed">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm">Question {qIndex + 1}</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const questions = [...(currentModule.questions || [])];
                                    questions.splice(qIndex, 1);
                                    setCurrentModule(prev => ({
                                      ...prev,
                                      questions
                                    }));
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pb-3">
                              <div>
                                <Label htmlFor={`question-${qIndex}-text`} className="text-xs">Texte de la question</Label>
                                <Textarea
                                  id={`question-${qIndex}-text`}
                                  value={question.text || ""}
                                  onChange={(e) => {
                                    const questions = [...(currentModule.questions || [])];
                                    questions[qIndex] = { ...questions[qIndex], text: e.target.value };
                                    setCurrentModule(prev => ({ ...prev, questions }));
                                  }}
                                  placeholder="Texte de la question"
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`question-${qIndex}-type`} className="text-xs">Type de question</Label>
                                <Select
                                  value={question.type || "SINGLE"}
                                  onValueChange={(value) => {
                                    const questions = [...(currentModule.questions || [])];
                                    questions[qIndex] = { ...questions[qIndex], type: value };
                                    setCurrentModule(prev => ({ ...prev, questions }));
                                  }}
                                >
                                  <SelectTrigger id={`question-${qIndex}-type`} className="mt-1">
                                    <SelectValue placeholder="Type de question" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SINGLE">Choix unique</SelectItem>
                                    <SelectItem value="MULTIPLE">Choix multiples</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor={`question-${qIndex}-image`} className="text-xs">URL de l'image (optionnel)</Label>
                                <Input
                                  id={`question-${qIndex}-image`}
                                  value={question.image || ""}
                                  onChange={(e) => {
                                    const questions = [...(currentModule.questions || [])];
                                    questions[qIndex] = { ...questions[qIndex], image: e.target.value };
                                    setCurrentModule(prev => ({ ...prev, questions }));
                                  }}
                                  placeholder="URL de l'image"
                                  className="mt-1"
                                />
                              </div>
                              
                              {/* Options de réponse */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Options de réponse</Label>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      const questions = [...(currentModule.questions || [])];
                                      const options = [...(questions[qIndex].options || [])];
                                      options.push({
                                        id: `q${qIndex+1}-o${options.length+1}`,
                                        text: "",
                                        isCorrect: false
                                      });
                                      questions[qIndex] = { ...questions[qIndex], options };
                                      setCurrentModule(prev => ({ ...prev, questions }));
                                    }}
                                  >
                                    <PlusCircle className="h-3 w-3 mr-1" />
                                    Ajouter une option
                                  </Button>
                                </div>
                                
                                {question.options?.map((option, oIndex) => (
                                  <div key={option.id || oIndex} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`q${qIndex}-o${oIndex}-correct`}
                                      checked={option.isCorrect || false}
                                      onCheckedChange={(checked) => {
                                        const questions = [...(currentModule.questions || [])];
                                        const options = [...questions[qIndex].options];
                                        
                                        // Pour choix unique, désélectionner les autres options
                                        if (question.type === "SINGLE" && checked) {
                                          options.forEach((opt, i) => {
                                            options[i] = { ...opt, isCorrect: i === oIndex };
                                          });
                                        } else {
                                          options[oIndex] = { ...options[oIndex], isCorrect: !!checked };
                                        }
                                        
                                        questions[qIndex] = { ...questions[qIndex], options };
                                        setCurrentModule(prev => ({ ...prev, questions }));
                                      }}
                                    />
                                    <Input
                                      value={option.text || ""}
                                      onChange={(e) => {
                                        const questions = [...(currentModule.questions || [])];
                                        const options = [...questions[qIndex].options];
                                        options[oIndex] = { ...options[oIndex], text: e.target.value };
                                        questions[qIndex] = { ...questions[qIndex], options };
                                        setCurrentModule(prev => ({ ...prev, questions }));
                                      }}
                                      placeholder={`Option ${oIndex + 1}`}
                                      className="flex-1"
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      disabled={question.options.length <= 2}
                                      onClick={() => {
                                        if (question.options.length <= 2) return;
                                        
                                        const questions = [...(currentModule.questions || [])];
                                        const options = [...questions[qIndex].options];
                                        options.splice(oIndex, 1);
                                        questions[qIndex] = { ...questions[qIndex], options };
                                        setCurrentModule(prev => ({ ...prev, questions }));
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {currentModule.type !== "guide" && currentModule.type !== "quiz" && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">Configuration avancée</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pour configurer ce type de module, utilisez l'éditeur de modules avancé.
                  </p>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveModule}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer le module
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}