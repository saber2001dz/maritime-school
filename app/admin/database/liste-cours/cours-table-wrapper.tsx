"use client"

import { CoursTable, type Cours } from "./cours-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CoursTableWrapperProps {
  cours: Cours[]
}

export function CoursTableWrapper({ cours }: CoursTableWrapperProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSaveEdit = async (cours: Cours): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/cours/${cours.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: cours.titre })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour du cours")
      }

      router.refresh()
      setIsUpdating(false)
      return { success: true }
    } catch (err: any) {
      setIsUpdating(false)
      return { success: false, error: err.message }
    }
  }

  const handleDeleteCours = async (coursId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/cours/${coursId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du cours")
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
    <CoursTable
      cours={cours}
      onSaveEdit={handleSaveEdit}
      onDeleteCours={handleDeleteCours}
      isUpdating={isUpdating}
    />
  )
}
