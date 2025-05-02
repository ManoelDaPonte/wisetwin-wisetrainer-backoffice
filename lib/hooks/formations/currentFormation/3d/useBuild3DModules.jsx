//lib/hooks/formations/currentFormation/3d/useBuild3DModules.jsx
"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook pour gérer les modules et le mapping d'un build 3D
 * @param {string} formationId - ID de la formation
 * @param {string} buildId - ID du build 3D
 */
export default function useBuild3DModules(formationId, buildId) {
  const [modules, setModules] = useState([]);
  const [objectMapping, setObjectMapping] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les modules et le mapping
  const fetchData = useCallback(async () => {
    if (!formationId || !buildId) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. Récupérer les modules
      const modulesResponse = await fetch(`/api/formations/${formationId}/content/3d/${buildId}/modules`);
      
      if (!modulesResponse.ok) {
        const errorData = await modulesResponse.json();
        throw new Error(errorData.error || "Erreur lors du chargement des modules");
      }
      
      const modulesData = await modulesResponse.json();
      setModules(modulesData.modules || []);
      
      // 2. Récupérer le mapping d'objets
      const mappingResponse = await fetch(`/api/formations/${formationId}/content/3d/${buildId}/mapping`);
      
      if (!mappingResponse.ok) {
        const errorData = await mappingResponse.json();
        throw new Error(errorData.error || "Erreur lors du chargement du mapping");
      }
      
      const mappingData = await mappingResponse.json();
      setObjectMapping(mappingData.objectMapping || {});
      
    } catch (err) {
      console.error("Erreur lors du chargement des données du build 3D:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formationId, buildId]);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sauvegarder les modules
  const saveModules = useCallback(async (updatedModules) => {
    if (!formationId || !buildId) {
      return Promise.reject(new Error("IDs manquants"));
    }

    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/formations/${formationId}/content/3d/${buildId}/modules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modules: updatedModules }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde des modules");
      }
      
      const data = await response.json();
      setModules(data.modules || updatedModules);
      console.log("Modules sauvegardés avec succès");
      
      return data;
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des modules:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [formationId, buildId]);

  // Sauvegarder le mapping
  const saveMapping = useCallback(async (updatedMapping) => {
    if (!formationId || !buildId) {
      return Promise.reject(new Error("IDs manquants"));
    }

    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/formations/${formationId}/content/3d/${buildId}/mapping`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ objectMapping: updatedMapping }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde du mapping");
      }
      
      const data = await response.json();
      setObjectMapping(data.objectMapping || updatedMapping);
      console.log("Mapping sauvegardé avec succès");
      
      return data;
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du mapping:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [formationId, buildId]);

  // Rafraîchir les données
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    modules,
    objectMapping,
    isLoading,
    error,
    isSaving,
    saveModules,
    saveMapping,
    refresh
  };
}