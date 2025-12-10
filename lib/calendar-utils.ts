import { type CalendarEvent, type EventColor } from "@/components/event-calendar/types"
import { type SessionFormation } from "@/components/ui/resizable-session-table"
import { convertUTCToLocalDate } from "@/lib/timezone-utils"

/**
 * Transform SessionFormation array to CalendarEvent array
 * Maps database sessions to calendar-compatible event objects
 *
 * Color coding strategy:
 * - Uses stored color if available (user-customized)
 * - Falls back to automatic color based on formation type:
 *   - تكوين إختصاص (Specialization) → sky (blue)
 *   - تكوين تخصصي (Specialized) → violet (purple)
 *   - تكوين مستمر (Continuous) → emerald (green)
 *
 * Note: Dates from DB are in UTC, we convert them to local time (GMT+1) for display
 */
export function transformSessionsToEvents(sessions: SessionFormation[]): CalendarEvent[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.formation.formation,
    description: generateDescription(session),
    start: convertUTCToLocalDate(session.dateDebut),
    end: convertUTCToLocalDate(session.dateFin),
    allDay: false, // Sessions span multiple days but aren't "all day" events
    color: (session.color as EventColor) || getColorByFormationType(session.formation.typeFormation),
    location: session.formation.typeFormation || undefined, // Changed from specialite to typeFormation (النوع)
    formationId: session.formationId,
    nombreParticipants: session.nombreParticipants,
    reference: session.reference || undefined,
  }))
}

/**
 * Generate Arabic event description with session details
 * Format: التخصص | المشاركون | المرجع | الوضعية
 */
function generateDescription(session: SessionFormation): string {
  const parts: string[] = []

  // Specialty
  if (session.formation.specialite) {
    parts.push(`التخصص: ${session.formation.specialite}`)
  }

  // Number of participants
  parts.push(`المشاركون: ${session.nombreParticipants}`)

  // Reference
  if (session.reference) {
    parts.push(`المرجع: ${session.reference}`)
  }

  // Status
  parts.push(`الوضعية: ${session.statut}`)

  return parts.join(" • ")
}

/**
 * Map formation type to calendar event color
 *
 * @param typeFormation - Formation type in Arabic
 * @returns EventColor - One of: sky, violet, emerald, amber, rose, orange
 */
function getColorByFormationType(typeFormation: string): EventColor {
  switch (typeFormation) {
    case "تكوين إختصاص":
      return "sky" // Blue - represents maritime/naval theme
    case "تكوين تخصصي":
      return "violet" // Purple - specialized training distinction
    case "تكوين مستمر":
      return "emerald" // Green - continuous/ongoing training
    default:
      return "amber" // Orange - fallback for unknown types
  }
}

/**
 * Transform CalendarEvent back to partial SessionFormation data
 * Used when creating/updating sessions from calendar interface
 *
 * Note: This returns partial data - formationId must be selected separately
 */
export function transformEventToSessionData(event: CalendarEvent) {
  return {
    dateDebut: event.start,
    dateFin: event.end,
    reference: null,
    nombreParticipants: 0,
    // formationId must be provided by form dialog
  }
}

/**
 * Get status color for badge display (alternative color coding by status)
 * Currently not used, but available for future enhancement
 */
export function getColorByStatus(statut: string): EventColor {
  switch (statut) {
    case "مبرمجة": // Scheduled
      return "sky"
    case "قيد التنفيذ": // In Progress
      return "emerald"
    case "انتهت": // Completed
      return "rose"
    default:
      return "amber"
  }
}
