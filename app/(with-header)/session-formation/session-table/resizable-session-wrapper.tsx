"use client"

import { ResizableSessionTableWithToast, type SessionFormation } from "@/components/ui/resizable-session-table"
import { useRouter } from "next/navigation"

interface ResizableSessionWrapperProps {
  sessions: SessionFormation[]
}

export function ResizableSessionWrapper({ sessions }: ResizableSessionWrapperProps) {
  const router = useRouter()

  const handleSessionSelect = (sessionId: string) => {
    // TODO: Implement session selection handler
    // Cette fonction devrait gérer la sélection d'une session pour :
    // - Afficher la liste des participants (قائمة المشاركين) dans un panneau latéral ou une page dédiée
    // - Naviguer vers une page de détails de la session
    // Actuellement, l'option "قائمة المشاركين" dans le menu dropdown est désactivée
    // (voir resizable-session-table.tsx ligne 1069-1075)
  }

  const handleSaveEdit = async (session: SessionFormation): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/session-formations/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formationId: session.formationId,
          dateDebut: session.dateDebut.toISOString(),
          dateFin: session.dateFin.toISOString(),
          reference: session.reference || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'حدث خطأ أثناء تحديث البيانات'
        }
      }

      // Rafraîchir les données de la page
      router.refresh()

      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      return {
        success: false,
        error: 'حدث خطأ أثناء تحديث البيانات'
      }
    }
  }

  const handleAddNewSession = () => {
    // Rafraîchir après ajout d'une session
    router.refresh()
  }

  return (
    <ResizableSessionTableWithToast
      title="Session"
      sessions={sessions}
      onSessionSelect={handleSessionSelect}
      onAddNewSession={handleAddNewSession}
      onSaveEdit={handleSaveEdit}
    />
  )
}
