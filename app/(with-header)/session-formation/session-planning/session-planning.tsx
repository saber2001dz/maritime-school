"use client"

import localFont from "next/font/local"
import { useRouter } from "next/navigation"
import { EventCalendar } from "@/components/event-calendar"
import { type CalendarEvent } from "@/components/event-calendar/types"
import { transformSessionsToEvents } from "@/lib/calendar-utils"
import { type SessionFormation } from "@/components/ui/resizable-session-table"
import { toUTCPreservingTime, convertUTCToLocalDate } from "@/lib/timezone-utils"
import { useToast } from "@/components/ui/ultra-quality-toast"

const notoNaskhArabic = localFont({
  src: "../../../fonts/NotoNaskhArabic.woff2",
  variable: "--font-noto-naskh-arabic",
})

interface Formation {
  id: string
  formation: string
}

interface SessionPlanningProps {
  sessions: SessionFormation[]
  formations: Formation[]
}

/**
 * SessionPlanning Component
 *
 * Displays session formations in a calendar view using the EventCalendar component.
 * Integrates with the session-formation page tabs system.
 *
 * Features:
 * - Month, week, day, and agenda views
 * - Color-coded events (auto by formation type or user-customized)
 * - Drag & drop event editing with date/time updates
 * - Color customization through event dialog
 * - RTL support for Arabic interface
 * - Dark mode compatible
 * - Responsive design
 * - Toast notifications for all CRUD operations
 *
 * Current Implementation:
 * - ✅ Event creation with toast notification
 * - ✅ Event update (dates, color, participants) with toast notification
 * - ✅ Event deletion with toast notification
 */
export function SessionPlanning({ sessions, formations }: SessionPlanningProps) {
  const router = useRouter()
  const { addToast } = useToast()

  // Transform sessions to calendar events
  const calendarEvents = transformSessionsToEvents(sessions)

  /**
   * Handle event addition
   * Creates a new session in the database
   */
  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      // Validation
      if (!event.formationId) {
        addToast({
          variant: "warning",
          title: "تحذير",
          description: "يجب اختيار دورة تكوينية",
        })
        return
      }

      if (!event.start || !event.end) {
        addToast({
          variant: "warning",
          title: "تحذير",
          description: "يجب تحديد تاريخ البداية والنهاية",
        })
        return
      }

      // Create session via API
      const response = await fetch('/api/session-formations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formationId: event.formationId,
          dateDebut: toUTCPreservingTime(event.start),
          dateFin: toUTCPreservingTime(event.end),
          reference: event.reference || null,
          nombreParticipants: event.nombreParticipants || 0,
          color: event.color || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create session: ${response.status}`)
      }

      await response.json()

      // Show success toast
      addToast({
        variant: "success",
        title: "نجح الإضافة",
        description: "تم إضافة الجلسة بنجاح",
      })

      // Refresh the page to show new data
      router.refresh()
    } catch (error) {
      console.error("❌ Error creating session:", error)
      addToast({
        variant: "error",
        title: "خطأ في الإضافة",
        description: error instanceof Error ? error.message : 'خطأ غير معروف',
      })
    }
  }

  /**
   * Handle event update
   * Saves event changes (dates, color, formationId, nombreParticipants, etc.) to the database
   */
  const handleEventUpdate = async (event: CalendarEvent) => {
    console.log("✏️ Event update requested:", event)

    try {
      // Find the original session to compare
      const originalSession = sessions.find(s => s.id === event.id)
      if (!originalSession) {
        addToast({
          variant: "error",
          title: "خطأ",
          description: "لم يتم العثور على الجلسة",
        })
        throw new Error('Session non trouvée')
      }

      // Build update payload with only changed fields
      const updatePayload: any = {}

      // Check if dates changed (compare the adjusted local times)
      const originalStart = convertUTCToLocalDate(originalSession.dateDebut).getTime()
      const originalEnd = convertUTCToLocalDate(originalSession.dateFin).getTime()
      const newStart = event.start.getTime()
      const newEnd = event.end.getTime()

      if (originalStart !== newStart) {
        updatePayload.dateDebut = toUTCPreservingTime(event.start)
      }
      if (originalEnd !== newEnd) {
        updatePayload.dateFin = toUTCPreservingTime(event.end)
      }

      // Check if color changed
      if (originalSession.color !== event.color) {
        updatePayload.color = event.color || null
      }

      // Check if formationId changed
      if (event.formationId && originalSession.formationId !== event.formationId) {
        updatePayload.formationId = event.formationId
      }

      // Check if nombreParticipants changed
      if (event.nombreParticipants !== undefined && originalSession.nombreParticipants !== event.nombreParticipants) {
        updatePayload.nombreParticipants = event.nombreParticipants
      }

      // Check if reference changed
      if (event.reference !== undefined && originalSession.reference !== event.reference) {
        updatePayload.reference = event.reference || null
      }

      // If nothing changed, don't make API call
      if (Object.keys(updatePayload).length === 0) {
        console.log("ℹ️ No changes detected, skipping update")
        addToast({
          variant: "info",
          title: "معلومة",
          description: "لم يتم إجراء أي تغييرات",
        })
        return
      }

      console.log("📤 Sending update:", updatePayload)

      const response = await fetch(`/api/session-formations/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ API Error:", response.status, errorData)
        throw new Error(errorData.error || `Failed to update event: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Event updated successfully:", result)

      // Show success toast
      addToast({
        variant: "success",
        title: "نجح التحديث",
        description: "تم تحديث الجلسة بنجاح",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("❌ Error updating event:", error)
      addToast({
        variant: "error",
        title: "خطأ في التحديث",
        description: error instanceof Error ? error.message : 'خطأ غير معروف',
      })
    }
  }

  /**
   * Handle event deletion
   * Deletes the session from the database
   */
  const handleEventDelete = async (eventId: string) => {
    console.log("🗑️ Event delete requested:", eventId)

    try {
      const response = await fetch(`/api/session-formations/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ API Error:", response.status, errorData)
        throw new Error(errorData.error || `Failed to delete event: ${response.status}`)
      }

      console.log("✅ Event deleted successfully")

      // Show error toast (red color for deletion)
      addToast({
        variant: "error",
        title: "نجح الحذف",
        description: "تم حذف الدورة بنجاح",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error("❌ Error deleting event:", error)
      addToast({
        variant: "error",
        title: "خطأ في الحذف",
        description: error instanceof Error ? error.message : 'خطأ غير معروف',
      })
    }
  }

  return (
    <div className={`w-full ${notoNaskhArabic.variable}`} dir="rtl" style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
      <EventCalendar
        events={calendarEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="month"
        className="bg-background"
        formations={formations}
      />
    </div>
  )
}
