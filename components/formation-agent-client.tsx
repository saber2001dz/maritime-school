"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ProjectDataTable, Project } from "@/components/ui/project-data-table";
import DialogueEditionFormation, { AgentFormationData, SessionFormationOption } from "@/components/dialogue-edition-formation";
import { useToast } from "@/components/ui/ultra-quality-toast";
import { can } from "@/lib/permissions";
import { usePermissions } from "@/lib/permissions-context";

interface FormationAgentClientProps {
  data: Project[];
  agentInfo: { grade: string; nomPrenom: string } | null;
  agentId?: string;
  notoNaskhArabicClassName: string;
  returnUrl: string;
  userRole?: string | null;
}

const allColumns: (keyof Project)[] = ["name", "repository", "team", "tech", "createdAt", "contributors", "status"];

export default function FormationAgentClient({
  data,
  agentInfo,
  agentId,
  notoNaskhArabicClassName,
  returnUrl,
  userRole,
}: FormationAgentClientProps) {
  const permissionsMap = usePermissions();
  const router = useRouter();
  const { addToast } = useToast();
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Project>>(new Set(allColumns));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sessionFormations, setSessionFormations] = useState<SessionFormationOption[]>([]);
  const [isLoadingFormations, setIsLoadingFormations] = useState(false);
  const [editFormationData, setEditFormationData] = useState<AgentFormationData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = async (project: Project) => {
    setSelectedProject(project);
    setIsLoadingFormations(true);

    // Charger les sessions de formation via l'API avec marquage des inscriptions
    await loadSessionFormations(project.sessionFormationId);

    // Définir les données du formulaire avec le sessionFormationId du project
    setEditFormationData({
      sessionFormationId: project.sessionFormationId || "",
      dateDebut: project.team || "",
      dateFin: project.tech || "",
      reference: project.createdAt || "",
      resultat: typeof project.status === "string" ? project.status : (project.status.value || ""),
      moyenne: parseFloat(project.contributors) || 0,
    });

    setIsEditDialogOpen(true);
  };

  const loadSessionFormations = async (currentSessionFormationId?: string) => {
    setIsLoadingFormations(true);
    try {
      // Charger les sessions de formation
      const sessionsResponse = await fetch("/api/session-formations");
      if (!sessionsResponse.ok) {
        throw new Error("Failed to load sessions");
      }
      const sessionsData = await sessionsResponse.json();
      const allSessions = sessionsData.sessions || [];

      // Charger les inscriptions existantes de l'agent
      let enrolledSessionIds: string[] = [];
      if (agentId) {
        const enrollmentsResponse = await fetch(`/api/agent-formations?agentId=${agentId}`);
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          enrolledSessionIds = enrollmentsData.agentFormations
            .filter((af: any) => af.sessionFormationId)
            .map((af: any) => af.sessionFormationId);
        }
      }

      // Marquer les sessions déjà utilisées (sauf la session en cours de modification)
      const sessionsWithEnrollmentStatus = allSessions.map((session: SessionFormationOption) => ({
        ...session,
        isAlreadyEnrolled: enrolledSessionIds.includes(session.id) && session.id !== currentSessionFormationId
      }));

      setSessionFormations(sessionsWithEnrollmentStatus);
    } catch (err) {
      console.error("Erreur lors du chargement des sessions de formation:", err);
    } finally {
      setIsLoadingFormations(false);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    setEditFormationData(null);
  };

  const handleSaveEdit = async (data: AgentFormationData) => {
    if (!selectedProject) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/agent-formations/${selectedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionFormationId: data.sessionFormationId,
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

      // Afficher un message de succès
      addToast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث بيانات التكوين بنجاح",
        variant: "success",
      });

      // Rafraîchir les données de la page
      router.refresh();
      handleCloseDialog();
    } catch (err: any) {
      // Afficher le message d'erreur via toast
      addToast({
        title: "خطأ في الحفظ",
        description: err.message || "حدث خطأ أثناء حفظ البيانات",
        variant: "error",
        duration: 6000,
      });
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
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/agent-formations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erreur lors de la suppression de la formation");
      }

      // Afficher un message de succès
      addToast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الدورة التكوينية بنجاح",
        variant: "success",
      });

      // Rafraîchir les données de la page
      router.refresh();
      handleCloseDialog();
    } catch (err: any) {
      // Afficher le message d'erreur via toast
      addToast({
        title: "خطأ في الحذف",
        description: err.message || "حدث خطأ أثناء حذف البيانات",
        variant: "error",
        duration: 6000,
      });
    } finally {
      setIsDeleting(false);
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

          <ProjectDataTable projects={data} visibleColumns={visibleColumns} onEditClick={can(userRole, "agentFormation", "edit", permissionsMap) ? handleEditClick : undefined} />
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
            sessionFormations={sessionFormations}
            formationData={editFormationData}
            agentFormationId={selectedProject?.id}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveEdit}
            onDelete={can(userRole, "agentFormation", "delete", permissionsMap) ? handleDelete : undefined}
            onChange={handleFormationChange}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isLoadingFormations={isLoadingFormations}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
