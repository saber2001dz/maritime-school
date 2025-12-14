"use client"

import { useState } from "react"
import { ResizableSessionTableWithToast, type SessionFormation } from "@/components/ui/resizable-session-table"
import { SessionEventDialogAdapter } from "@/components/session-event-dialog-adapter"

interface ResizableSessionWrapperProps {
  sessions: SessionFormation[]
  onSessionCreated?: (session: SessionFormation) => void
  onSessionUpdated?: (session: SessionFormation) => void
  onSessionDeleted?: (sessionId: string) => void
}

export function ResizableSessionWrapper({
  sessions,
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
}: ResizableSessionWrapperProps) {
  const [selectedSession, setSelectedSession] = useState<SessionFormation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSessionSelect = (sessionId: string) => {
    // TODO: Implement session selection handler
    // Cette fonction devrait gérer la sélection d'une session pour :
    // - Afficher la liste des participants (قائمة المشاركين) dans un panneau latéral ou une page dédiée
    // - Naviguer vers une page de détails de la session
    // Actuellement, l'option "قائمة المشاركين" dans le menu dropdown est désactivée
    // (voir resizable-session-table.tsx ligne 1069-1075)
  }

  const handleAddNewSession = () => {
    setSelectedSession(null)  // null = create mode
    setIsDialogOpen(true)
  }

  const handleEditSession = (session: SessionFormation) => {
    setSelectedSession(session)  // edit mode
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedSession(null)
  }

  const handleSessionCreated = (newSession: SessionFormation) => {
    // Propager au parent pour synchroniser avec l'autre onglet
    onSessionCreated?.(newSession)
  }

  const handleSessionUpdated = (updatedSession: SessionFormation) => {
    // Propager au parent pour synchroniser avec l'autre onglet
    onSessionUpdated?.(updatedSession)
  }

  const handleSessionDeleted = (sessionId: string) => {
    // Propager au parent pour synchroniser avec l'autre onglet
    onSessionDeleted?.(sessionId)
  }

  return (
    <>
      <ResizableSessionTableWithToast
        title="Session"
        sessions={sessions}
        onSessionSelect={handleSessionSelect}
        onAddNewSession={handleAddNewSession}
        onEditSession={handleEditSession}
      />

      <SessionEventDialogAdapter
        session={selectedSession}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSessionCreated={handleSessionCreated}
        onSessionUpdated={handleSessionUpdated}
        onSessionDeleted={handleSessionDeleted}
      />
    </>
  )
}
