"use client"

import { FormationsTable, type Formation } from "./formations-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface FormationsTableWrapperProps {
  formations: Formation[]
}

export function FormationsTableWrapper({ formations }: FormationsTableWrapperProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSaveEdit = async (formation: Formation): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/formations/${formation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formation: formation.formation,
          typeFormation: formation.typeFormation,
          specialite: formation.specialite,
          duree: formation.duree,
          capaciteAbsorption: formation.capaciteAbsorption,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour de la formation")
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

  const handleDeleteFormation = async (formationId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/formations/${formationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la formation")
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
    <FormationsTable
      formations={formations}
      onSaveEdit={handleSaveEdit}
      onDeleteFormation={handleDeleteFormation}
      isUpdating={isUpdating}
    />
  )
}
