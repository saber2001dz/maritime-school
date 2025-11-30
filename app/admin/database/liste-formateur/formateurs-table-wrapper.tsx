"use client"

import { FormateursTable, type Formateur } from "./formateurs-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface FormateursTableWrapperProps {
  formateurs: Formateur[]
}

export function FormateursTableWrapper({ formateurs }: FormateursTableWrapperProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSaveEdit = async (formateur: Formateur): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/formateurs/${formateur.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomPrenom: formateur.nomPrenom,
          grade: formateur.grade,
          unite: formateur.unite,
          responsabilite: formateur.responsabilite,
          telephone: formateur.telephone,
          RIB: formateur.RIB,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour du formateur")
      }

      // Revalidate data without full page reload
      router.refresh()

      setIsUpdating(false)
      return { success: true }
    } catch (err: any) {
      setIsUpdating(false)
      return { success: false, error: err.message }
    }
  }

  const handleDeleteFormateur = async (formateurId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/formateurs/${formateurId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du formateur")
      }

      // Revalidate data without full page reload
      router.refresh()

      setIsUpdating(false)
      return { success: true }
    } catch (err: any) {
      setIsUpdating(false)
      return { success: false, error: err.message }
    }
  }

  return (
    <FormateursTable
      formateurs={formateurs}
      onSaveEdit={handleSaveEdit}
      onDeleteFormateur={handleDeleteFormateur}
      isUpdating={isUpdating}
    />
  )
}
