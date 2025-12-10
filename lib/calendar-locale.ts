/**
 * Calendar locale configuration for Arabic display
 * Provides day and month names in Arabic
 */

/**
 * Arabic day names (full and abbreviated)
 * Week starts on Monday (index 0 = Monday)
 */
export const arabicDayNames = {
  full: [
    "الاثنين",   // Monday
    "الثلاثاء",  // Tuesday
    "الأربعاء",  // Wednesday
    "الخميس",    // Thursday
    "الجمعة",    // Friday
    "السبت",     // Saturday
    "الأحد",     // Sunday
  ],
  abbreviated: [
    "الإثنين",  // Mon
    "الثلاثاء", // Tue
    "الأربعاء", // Wed
    "الخميس",   // Thu
    "الجمعة",   // Fri
    "السبت",    // Sat
    "الأحد",    // Sun
  ],
  short: [
    "ن",  // Mon (ن for نين)
    "ث",  // Tue (ث for ثلاثاء)
    "ر",  // Wed (ر for أربعاء)
    "خ",  // Thu (خ for خميس)
    "ج",  // Fri (ج for جمعة)
    "س",  // Sat (س for سبت)
    "ح",  // Sun (ح for أحد)
  ],
}

/**
 * Arabic month names (full and abbreviated)
 */
export const arabicMonthNames = {
  full: [
    "جانفي",
    "فيفري",
    "مارس",
    "أفريل",
    "ماي",
    "جوان",
    "جويلية",
    "أوت",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
  abbreviated: [
    "جان",
    "فبر",
    "مار",
    "أفر",
    "ماي",
    "جوان",
    "جوي",
    "أوت",
    "سبت",
    "أكت",
    "نوف",
    "ديس",
  ],
}

/**
 * Get Arabic day name for a given day index (0 = Monday, 6 = Sunday)
 */
export function getArabicDayName(dayIndex: number, format: 'full' | 'abbreviated' | 'short' = 'full'): string {
  return arabicDayNames[format][dayIndex]
}

/**
 * Get Arabic month name for a given month index (0 = January, 11 = December)
 */
export function getArabicMonthName(monthIndex: number, format: 'full' | 'abbreviated' = 'full'): string {
  return arabicMonthNames[format][monthIndex]
}

/**
 * Format date in Arabic
 * Example: "الاثنين، 15 يناير 2024"
 */
export function formatDateInArabic(date: Date): string {
  const dayOfWeek = (date.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
  const dayName = getArabicDayName(dayOfWeek, 'full')
  const monthName = getArabicMonthName(date.getMonth(), 'full')
  const dayOfMonth = date.getDate()
  const year = date.getFullYear()

  return `${dayName}، ${dayOfMonth} ${monthName} ${year}`
}
