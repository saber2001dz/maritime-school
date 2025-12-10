import { isSameDay } from "date-fns"

import type { CalendarEvent, EventColor } from "@/components/event-calendar"

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color?: EventColor | string): string {
  const eventColor = color || "sky"

  switch (eventColor) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8"
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8"
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8"
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8"
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8"
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8"
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8"
  }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(
  isFirstDay: boolean,
  isLastDay: boolean
): string {
  if (isFirstDay && isLastDay) {
    return "rounded" // Both ends rounded
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none" // Only left end rounded
  } else if (isLastDay) {
    return "rounded-r rounded-l-none" // Only right end rounded
  } else {
    return "rounded-none" // No rounded corners
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  return event.allDay || eventStart.getDate() !== eventEnd.getDate()
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start)
      return isSameDay(day, eventStart)
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

/**
 * Assign track numbers to events so multi-day events stay on the same horizontal line
 * Events with later end dates get lower track numbers (displayed on top)
 *
 * Algorithm:
 * 1. Sort events by end date (latest first), then by start date
 * 2. Assign each event to the lowest available track where it doesn't overlap
 * 3. Return a map of event IDs to track numbers
 */
function assignEventTracks(events: CalendarEvent[]): Map<string, number> {
  const eventTracks = new Map<string, number>()

  // Sort events by end date (latest first), then start date
  const sortedEvents = [...events].sort((a, b) => {
    const aEndTime = new Date(a.end).getTime()
    const bEndTime = new Date(b.end).getTime()

    if (aEndTime !== bEndTime) {
      return bEndTime - aEndTime // Later end date first (reversed)
    }

    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })

  // Track the end time of events in each track
  const trackEndTimes: number[] = []

  for (const event of sortedEvents) {
    const eventStart = new Date(event.start).getTime()
    const eventEnd = new Date(event.end).getTime()

    // Find the first available track where this event doesn't overlap
    let assignedTrack = -1
    for (let i = 0; i < trackEndTimes.length; i++) {
      if (trackEndTimes[i] <= eventStart) {
        // This track is available
        assignedTrack = i
        trackEndTimes[i] = eventEnd
        break
      }
    }

    // If no track is available, create a new one
    if (assignedTrack === -1) {
      assignedTrack = trackEndTimes.length
      trackEndTimes.push(eventEnd)
    }

    eventTracks.set(event.id, assignedTrack)
  }

  return eventTracks
}

/**
 * Sort events using track assignment to ensure multi-day events stay on same line
 * Events are sorted by:
 * 1. Track number (lower = displayed on top, but assigned to events with later end dates)
 * 2. End date (latest first within same track)
 * 3. Start time (earliest first)
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  if (events.length === 0) return []

  // Get track assignments
  const tracks = assignEventTracks(events)

  // Sort by track number, then by end date (reversed), then by start time
  return [...events].sort((a, b) => {
    const aTrack = tracks.get(a.id) ?? Infinity
    const bTrack = tracks.get(b.id) ?? Infinity

    // Primary sort: by track number (lower tracks first = longer events on top)
    if (aTrack !== bTrack) {
      return aTrack - bTrack
    }

    // Secondary sort: by end date (later end dates first within same track)
    const aEndTime = new Date(a.end).getTime()
    const bEndTime = new Date(b.end).getTime()
    if (aEndTime !== bEndTime) {
      return bEndTime - aEndTime
    }

    // Tertiary sort: by start time
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false

    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    )
  })
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    )
  })
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (day > eventStart && day < eventEnd)
      )
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}
