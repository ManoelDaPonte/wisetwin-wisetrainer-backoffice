//app/formations/[id]/content/3d/[buildId]/page.jsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ArrowLeft, Box, RefreshCw, Trash2, ExternalLink, FileText } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useFormationDetails } from "@/lib/hooks/formations/currentFormation/useCurrentFormationDetails";

export default function Build3DDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const { formation, isLoading, error, refreshFormation } = useFormationDetails(params.id);
  
  // Trouver le build spécifique
  const build = formation?.builds3D?.find(b => b.id === params.buildId);
  
  const handleBack = () => {
    router.push(`/formations/${params.id}`);
  };
  
  const handleReplaceBuild = () => {
    router.push(`/formations/${params.id}/content/3d/add`);
  };
  
  const handleDeleteBuild = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const response = await fetch(`/api/formations/${params.id}/content/3d/${params.buildId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression du cours 3D");
      }
      
      // Rediriger vers la page de détails de la formation
      router.push(`/formations/${params.id}`);
    } catch (err) {
      console.error("Erreur:", err);
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !build) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la formation
          </Button>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || "Cours 3D non trouvé"}
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la formation
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold">Détails du cours 3D</h1>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-wisetwin-blue" />
              <CardTitle>{build.name}</CardTitle>
            </div>
            <CardDescription>
              {build.description || "Aucune description"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium">Informations</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">{build.version}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{build.status === "available" ? "Disponible" : build.status}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Créé le:</span>
                    <span className="font-medium">{new Date(build.createdAt).toLocaleDateString("fr-FR")}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Mis à jour le:</span>
                    <span className="font-medium">{new Date(build.updatedAt).toLocaleDateString("fr-FR")}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Container Azure:</span>
                    <span className="font-medium">{build.containerName || "Non spécifié"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Modules:</span>
                    <span className="font-medium">{build.modules?.length || 0}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Actions</h3>
                <div className="mt-2 space-y-2">
                  {build.azureUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(build.azureUrl, "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Tester le cours 3D
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/formations/${params.id}/content/3d/${params.buildId}/modules`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les modules et mappings
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleReplaceBuild}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Remplacer ce cours 3D
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer ce cours 3D
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supprimer le cours 3D</DialogTitle>
                      </DialogHeader>
                      <p>
                        Êtes-vous sûr de vouloir supprimer ce cours 3D ? Cette action est irréversible.
                      </p>
                      {deleteError && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{deleteError}</AlertDescription>
                        </Alert>
                      )}
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteBuild}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Suppression en cours...
                            </>
                          ) : (
                            "Confirmer la suppression"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}