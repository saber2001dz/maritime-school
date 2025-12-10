/**
 * Shared utility for computing session status based on dates
 * Used by both Server Components and API routes
 */
export function computeSessionStatus(dateDebut: Date, dateFin: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day

  const debut = new Date(dateDebut)
  debut.setHours(0, 0, 0, 0)

  const fin = new Date(dateFin)
  fin.setHours(0, 0, 0, 0)

  if (today < debut) {
    return 'مبرمجة' // Scheduled
  } else if (today >= debut && today <= fin) {
    return 'قيد التنفيذ' // In Progress
  } else {
    return 'انتهت' // Completed
  }
}
