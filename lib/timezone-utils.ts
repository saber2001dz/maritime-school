/**
 * Timezone utilities for handling date/time storage and display
 *
 * Problem:
 * - User in GMT+1 selects 08:00 in the calendar
 * - JavaScript Date creates: Mon Jan 15 2024 08:00:00 GMT+0100
 * - toISOString() converts to UTC: "2024-01-15T07:00:00.000Z"
 * - Database stores: 07:00 UTC
 * - When we read it back: new Date("2024-01-15T07:00:00.000Z") shows as 08:00 GMT+1 again
 *
 * The issue: PostgreSQL stores dates in UTC, but when we convert with toISOString(),
 * it adjusts for the browser's timezone. We want to store the "wall clock" time as-is.
 *
 * Solution:
 * - Save: Add +1h before toISOString() to compensate (08:00 → 09:00 → "08:00Z")
 * - Read: Subtract -1h after parsing to compensate ("08:00Z" → 09:00 → 08:00 displayed)
 */

const TIMEZONE_OFFSET_HOURS = 1 // GMT+1 for Tunisia/Algeria

/**
 * Convert Date to ISO string, preserving the wall-clock time in UTC
 *
 * Example:
 * - Input: Date object showing 08:00 in browser (GMT+1)
 * - Browser toISOString(): "2024-01-15T07:00:00.000Z" (WRONG - shows 07:00)
 * - This function: "2024-01-15T08:00:00.000Z" (CORRECT - stores 08:00)
 */
export function toUTCPreservingTime(date: Date): string {
  const adjustedDate = new Date(date.getTime() + (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000))
  return adjustedDate.toISOString()
}

/**
 * Convert UTC ISO string to Date, preserving the wall-clock time for display
 *
 * Example:
 * - Input: "2024-01-15T08:00:00.000Z" from database
 * - new Date() would show: 09:00 in GMT+1 browser (WRONG)
 * - This function: Date showing 08:00 in browser (CORRECT)
 */
export function convertUTCToLocalDate(utcDateString: string | Date): Date {
  const utcDate = typeof utcDateString === 'string' ? new Date(utcDateString) : new Date(utcDateString)
  const adjustedDate = new Date(utcDate.getTime() - (TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000))
  return adjustedDate
}
