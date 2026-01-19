"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ProjectDataTable, Project } from "@/components/ui/project-data-table";
import DialogueEditionCoursFormateur, { CoursFormateurData, Cours } from "@/components/dialogue-edition-cours-formateur";

interface CoursFormateurClientProps {
  initialData: Project[];
  formateurInfo: { grade: string; nomPrenom: string } | null;
  notoNaskhArabicClassName: string;
  returnUrl?: string;
}

const allColumns: (keyof Project)[] = ["name", "repository", "team", "tech", "createdAt", "contributors", "status"];

// En-têtes personnalisés pour la page cours-formateur
const coursFormateurHeaders = [
  { key: "name" as const, label: "#", width: "w-10" },
  { key: "repository" as const, label: "الــــــــــدورة التـكــويـنـيــــة", width: "w-60" },
  { key: "team" as const, label: "تــاريـخ البــدايــة", width: "w-28" },
  { key: "tech" as const, label: "تــاريـخ النهــايـــة", width: "w-28" },
  { key: "createdAt" as const, label: "المــرجــــــــع", width: "w-50" },
  { key: "contributors" as const, label: "عــدد الساعـات", width: "w-26" },
  { key: "status" as const, label: "النـتـيـجــــــة", width: "w-12" },
  { key: "actions" as const, label: "خيــــارات", width: "w-18" },
];

export default function CoursFormateurClient({ initialData, formateurInfo, notoNaskhArabicClassName, returnUrl = '/liste-formateur' }: CoursFormateurClientProps) {
  const router = useRouter();
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Project>>(new Set(allColumns));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [isLoadingCours, setIsLoadingCours] = useState(false);
  const [editCoursData, setEditCoursData] = useState<CoursFormateurData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleEditClick = async (project: Project) => {
    setSelectedProject(project);

    // Charger les cours d'abord
    await loadCours();

    // Définir les données du formulaire avec le coursId du project
    setEditCoursData({
      coursId: project.formationId || "",
      dateDebut: project.team || "",
      dateFin: project.tech || "",
      nombreHeures: parseFloat(project.contributors) || 0,
    });

    setIsEditDialogOpen(true);
  };

  const loadCours = async () => {
    setIsLoadingCours(true);
    try {
      const response = await fetch("/api/cours");
      if (response.ok) {
        const data = await response.json();
        setCoursList(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des cours:", err);
    } finally {
      setIsLoadingCours(false);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    setEditCoursData(null);
    setError("");
  };

  const handleSaveEdit = async (data: CoursFormateurData) => {
    if (!selectedProject) return;

    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch(`/api/cours-formations/${selectedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coursId: data.coursId,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          nombreHeures: data.nombreHeures,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour du cours");
      }

      // Rafraîchir les données
      router.refresh();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCoursChange = (field: string, value: string | number) => {
    if (editCoursData) {
      setEditCoursData({
        ...editCoursData,
        [field]: value,
      });
    }
  };

  const handleBackClick = () => {
    router.push(returnUrl);
  };

  return (
    <div className="bg-background py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="mb-8 md:mb-12 pt-10">
          {/* Header avec le même style que liste-formation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackClick}
                  className="p-1.5 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                  aria-label="Retour à la liste des formateurs"
                >
                  <ChevronRight className="h-5 w-5 text-foreground/70 hover:text-foreground" />
                </button>
                <h1 className={`text-xl font-bold text-foreground ${notoNaskhArabicClassName}`}>
                  قــائـمــة الـــدروس
                  {formateurInfo && (
                    <span className="text-foreground/60 font-normal mr-2">
                      : ال{formateurInfo.grade} {formateurInfo.nomPrenom}
                    </span>
                  )}
                </h1>
              </div>
            </div>
          </div>

          <ProjectDataTable projects={initialData} visibleColumns={visibleColumns} onEditClick={handleEditClick} customHeaders={coursFormateurHeaders} />
        </div>
      </div>

      {/* Dialogue d'édition de cours */}
      <AnimatePresence mode="wait">
        {isEditDialogOpen && formateurInfo && (
          <DialogueEditionCoursFormateur
            formateur={{
              id: "",
              nomPrenom: formateurInfo.nomPrenom,
              grade: formateurInfo.grade,
            }}
            coursList={coursList}
            coursData={editCoursData}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveEdit}
            onChange={handleCoursChange}
            isUpdating={isUpdating}
            isLoadingCours={isLoadingCours}
            error={error}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
