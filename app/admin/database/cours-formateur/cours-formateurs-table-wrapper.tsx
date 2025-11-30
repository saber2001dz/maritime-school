"use client"

import { CoursFormateursTable, type CoursFormateurWithRelations } from "./cours-formateurs-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CoursFormateursTableWrapperProps {
  coursFormateurs: CoursFormateurWithRelations[]
}

export function CoursFormateursTableWrapper({ coursFormateurs }: CoursFormateursTableWrapperProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSaveEdit = async (coursFormateur: CoursFormateurWithRelations): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/cours-formations/${coursFormateur.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coursId: coursFormateur.coursId,
          dateDebut: coursFormateur.dateDebut,
          dateFin: coursFormateur.dateFin,
          nombreHeures: coursFormateur.nombreHeures,
          reference: coursFormateur.reference,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour du cours formateur")
      }

      router.refresh()
      setIsUpdating(false)
      return { success: true }
    } catch (err: any) {
      setIsUpdating(false)
      return { success: false, error: err.message }
    }
  }

  const handleDeleteCoursFormateur = async (coursFormateurId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/cours-formations/${coursFormateurId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du cours formateur")
      }

      router.refresh()
      setIsUpdating(false)
      return { success: true }
    } catch (err: any) {
      setIsUpdating(false)
      return { success: false, error: err.message }
    }
  }

  return (
    <CoursFormateursTable
      coursFormateurs={coursFormateurs}
      onSaveEdit={handleSaveEdit}
      onDeleteCoursFormateur={handleDeleteCoursFormateur}
      isUpdating={isUpdating}
    />
  )
}
