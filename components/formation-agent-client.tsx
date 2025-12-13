"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ProjectDataTable, Project } from "@/components/ui/project-data-table";
import DialogueEditionFormation, { AgentFormationData, Formation } from "@/components/dialogue-edition-formation";

interface FormationAgentClientProps {
  data: Project[];
  agentInfo: { grade: string; nomPrenom: string } | null;
  notoNaskhArabicClassName: string;
  returnUrl: string;
}

const allColumns: (keyof Project)[] = ["name", "repository", "team", "tech", "createdAt", "contributors", "status"];

export default function FormationAgentClient({
  data,
  agentInfo,
  notoNaskhArabicClassName,
  returnUrl,
}: FormationAgentClientProps) {
  const router = useRouter();
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Project>>(new Set(allColumns));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoadingFormations, setIsLoadingFormations] = useState(false);
  const [editFormationData, setEditFormationData] = useState<AgentFormationData | null>(null);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = async (project: Project) => {
    setSelectedProject(project);
    setIsLoadingFormations(true);

    // Charger les formations via l'API
    try {
      const response = await fetch("/api/formations");
      if (response.ok) {
        const loadedFormations = await response.json();
        setFormations(loadedFormations);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des formations:", err);
    }

    setIsLoadingFormations(false);

    // Définir les données du formulaire avec le formationId du project
    setEditFormationData({
      formationId: project.formationId || "",
      dateDebut: project.team || "",
      dateFin: project.tech || "",
      reference: project.createdAt || "",
      resultat: typeof project.status === "string" ? project.status : project.status.text,
      moyenne: parseFloat(project.contributors) || 0,
    });

    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    setEditFormationData(null);
    setError("");
  };

  const handleSaveEdit = async (data: AgentFormationData) => {
    if (!selectedProject) return;

    setError("");
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/agent-formations/${selectedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formationId: data.formationId,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          reference: data.reference,
          resultat: data.resultat,
          moyenne: data.moyenne,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour de la formation");
      }

      // Rafraîchir les données de la page
      router.refresh();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFormationChange = (field: string, value: string | number) => {
    if (editFormationData) {
      setEditFormationData({
        ...editFormationData,
        [field]: value,
      });
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/agent-formations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erreur lors de la suppression de la formation");
      }

      // Rafraîchir les données de la page
      router.refresh();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackClick = () => {
    router.push(returnUrl);
  };

  return (
    <div className="min-h-screen bg-background py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="mb-8 md:mb-12 pt-10">
          {/* Header avec le même style que liste-formation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackClick}
                  className="p-1.5 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                  aria-label="Retour à la liste des agents"
                >
                  <ChevronRight className="h-5 w-5 text-foreground/70 hover:text-foreground" />
                </button>
                <h1 className={`text-xl font-bold text-foreground ${notoNaskhArabicClassName}`}>
                  قائمة الدورات التكوينية
                  {agentInfo && (
                    <span className="text-foreground/60 font-normal mr-2">
                      : ال{agentInfo.grade} {agentInfo.nomPrenom}
                    </span>
                  )}
                </h1>
              </div>
            </div>
          </div>

          <ProjectDataTable projects={data} visibleColumns={visibleColumns} onEditClick={handleEditClick} />
        </div>
      </div>

      {/* Dialogue d'édition de formation */}
      <AnimatePresence mode="wait">
        {isEditDialogOpen && agentInfo && (
          <DialogueEditionFormation
            agent={{
              id: "",
              nomPrenom: agentInfo.nomPrenom,
              grade: agentInfo.grade,
              matricule: "",
            }}
            formations={formations}
            formationData={editFormationData}
            agentFormationId={selectedProject?.id}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveEdit}
            onDelete={handleDelete}
            onChange={handleFormationChange}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isLoadingFormations={isLoadingFormations}
            error={error}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
