"use client"

import { useState, useEffect } from "react"
import { EventDialog } from "@/components/event-calendar/event-dialog"
import type { CalendarEvent, EventColor } from "@/components/event-calendar/types"
import type { SessionFormation } from "@/components/ui/resizable-session-table"
import { useToast } from "@/components/ui/ultra-quality-toast"

interface SessionEventDialogAdapterProps {
  session: SessionFormation | null  // null = create mode
  isOpen: boolean
  onClose: () => void
  onSessionCreated: (session: SessionFormation) => void
  onSessionUpdated: (session: SessionFormation) => void
  onSessionDeleted: (sessionId: string) => void
}

interface Formation {
  id: string
  formation: string
}

export function SessionEventDialogAdapter({
  session,
  isOpen,
  onClose,
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
}: SessionEventDialogAdapterProps) {
  const [formations, setFormations] = useState<Formation[]>([])
  const { addToast } = useToast()

  // Fetch formations list on mount
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch("/api/formations")
        if (!response.ok) throw new Error("Failed to fetch formations")
        const data = await response.json()
        setFormations(data)
      } catch (error) {
        console.error("Error fetching formations:", error)
        addToast({
          title: "خطأ",
          description: "فشل في تحميل قائمة الدورات التكوينية",
          variant: "error",
        })
      }
    }

    fetchFormations()
  }, [addToast])

  // Convert SessionFormation → CalendarEvent for dialog display
  const sessionToEvent = (sessionData: SessionFormation | null): CalendarEvent | null => {
    if (!sessionData) return null

    return {
      id: sessionData.id,
      title: sessionData.formation.formation,
      start: new Date(sessionData.dateDebut),
      end: new Date(sessionData.dateFin),
      formationId: sessionData.formationId,
      nombreParticipants: sessionData.nombreParticipants,
      reference: sessionData.reference || "",
      color: (sessionData.color as EventColor) || "sky",
      description: "",
      location: "",
      allDay: false,
    }
  }

  // Handle save (create or update)
  const handleSave = async (event: CalendarEvent) => {
    try {
      // Validate required fields
      if (!event.formationId) {
        addToast({
          title: "خطأ",
          description: "يجب اختيار دورة تكوينية",
          variant: "error",
        })
        return
      }

      const requestBody = {
        formationId: event.formationId,
        dateDebut: event.start.toISOString(),
        dateFin: event.end.toISOString(),
        reference: event.reference || null,
        nombreParticipants: event.nombreParticipants || 0,
        color: event.color || null,
      }

      const isUpdate = session?.id

      const response = await fetch(
        isUpdate ? `/api/session-formations/${session.id}` : "/api/session-formations",
        {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        addToast({
          title: "خطأ",
          description: data.error || "حدث خطأ أثناء حفظ البيانات",
          variant: "error",
        })
        return
      }

      addToast({
        title: "نجاح",
        description: isUpdate ? "تم تحديث الدورة بنجاح" : "تم إنشاء الدورة بنجاح",
        variant: "success",
      })

      // Appeler le callback approprié avec les données de la session
      if (isUpdate) {
        onSessionUpdated(data)
      } else {
        onSessionCreated(data)
      }
      onClose()
    } catch (error) {
      console.error("Error saving session:", error)
      addToast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "error",
      })
    }
  }

  // Handle delete
  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/session-formations/${eventId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        addToast({
          title: "خطأ",
          description: data.error || "حدث خطأ أثناء حذف الدورة",
          variant: "error",
        })
        return
      }

      addToast({
        title: "نجاح",
        description: "تم حذف الدورة بنجاح",
        variant: "success",
      })

      onSessionDeleted(eventId)
      onClose()
    } catch (error) {
      console.error("Error deleting session:", error)
      addToast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الدورة",
        variant: "error",
      })
    }
  }

  return (
    <EventDialog
      event={sessionToEvent(session)}
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      onDelete={handleDelete}
      formations={formations}
    />
  )
}
