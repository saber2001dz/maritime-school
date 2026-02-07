/**
 * Utilitaire central pour la gestion des résultats des formations
 * Utilisé par formation-agent et session-agent pour une cohérence totale
 */

export type ResultatVariant = "success" | "inProgress" | "interrupted" | "abandoned" | "notJoined" | "pending"

export interface ResultatOption {
  value: string
  label: string
  variant: ResultatVariant
}

/**
 * Liste des résultats possibles pour les formations
 * Source unique de vérité pour toute l'application
 */
export const RESULTAT_OPTIONS: ResultatOption[] = [
  { value: "قيد البرمجة", label: "قيد البرمجة", variant: "pending" },
  { value: "ناجح", label: "نــاجـح", variant: "success" },
  { value: "قيد التكوين", label: "قيد التكوين", variant: "inProgress" },
  { value: "راسب", label: "راســب", variant: "interrupted" },
  { value: "إنقطع", label: "إنقطــع", variant: "abandoned" },
  { value: "لم يلتحق", label: "لم يلتحق", variant: "notJoined" },
]

/**
 * Détermine le variant du badge en fonction du résultat
 */
export function getStatusVariant(resultat: string | null): ResultatVariant {
  if (!resultat) return "pending"

  const resultatTrimmed = resultat.trim()

  // Recherche exacte dans les options
  const option = RESULTAT_OPTIONS.find(opt => opt.value === resultatTrimmed)
  if (option) return option.variant

  // Fallback pour compatibilité avec anciennes valeurs
  return "pending"
}

/**
 * Obtient le label d'affichage pour un résultat donné
 */
export function getResultatLabel(resultat: string | null): string {
  if (!resultat) return "قيد البرمجة"

  const resultatTrimmed = resultat.trim()
  const option = RESULTAT_OPTIONS.find(opt => opt.value === resultatTrimmed)

  return option ? option.label : resultatTrimmed
}

/**
 * Obtient l'option complète pour un résultat donné
 */
export function getResultatOption(resultat: string | null): ResultatOption {
  if (!resultat) return RESULTAT_OPTIONS[0] // "قيد البرمجة"

  const resultatTrimmed = resultat.trim()
  const option = RESULTAT_OPTIONS.find(opt => opt.value === resultatTrimmed)

  return option || RESULTAT_OPTIONS[0]
}

/**
 * Obtient les options de résultat pour les formulaires d'ajout/édition
 * Exclut "قيد البرمجة" (pending) qui ne doit pas être sélectionnable manuellement
 */
export function getSelectableResultatOptions(): ResultatOption[] {
  return RESULTAT_OPTIONS.filter(opt => opt.variant !== "pending")
}
