export type CalendarView = "month" | "week" | "day" | "agenda"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: EventColor
  location?: string
  formationId?: string
  nombreParticipants?: number
  reference?: string
}

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange"
