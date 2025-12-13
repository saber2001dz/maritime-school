"use client"

import { ResizableTableFormateurWithToast, type Formateur } from "@/components/ui/resizable-table-formateur"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface ResizableTableWrapperProps {
  formateurs: Formateur[]
}

export function ResizableTableWrapper({ formateurs }: ResizableTableWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleFormateurSelect = (formateurId: string) => {
    console.log(`Selected formateur:`, formateurId)
  }

  const handleSaveEdit = async (formateur: Formateur): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/formateurs/${formateur.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error(data.error || 'Erreur lors de la mise à jour du formateur')
      }

      // Rafraîchir les données de la page
      router.refresh()

      setIsUpdating(false)
      return { success: true }
    } catch (err: any) {
      setIsUpdating(false)
      return { success: false, error: err.message }
    }
  }

  return (
    <ResizableTableFormateurWithToast
      formateurs={formateurs}
      onFormateurSelect={handleFormateurSelect}
      onSaveEdit={handleSaveEdit}
      isUpdating={isUpdating}
      onAddNewFormateur={() => router.push('/nouveau-formateur')}
      searchParams={searchParams}
    />
  )
}
