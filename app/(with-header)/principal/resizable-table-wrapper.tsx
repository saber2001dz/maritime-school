"use client"

import { ResizableTableWithToast, type Agent } from "@/components/ui/resizable-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ResizableTableWrapperProps {
  agents: Agent[]
}

export function ResizableTableWrapper({ agents }: ResizableTableWrapperProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAgentSelect = (agentId: string) => {
    console.log(`Selected agent:`, agentId)
  }

  const handleColumnResize = (columnKey: string, newWidth: number) => {
    console.log(`Column ${columnKey} resized to ${newWidth}px`)
  }

  const handleSaveEdit = async (agent: Agent): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomPrenom: agent.nomPrenom,
          grade: agent.grade,
          matricule: agent.matricule,
          responsabilite: agent.responsabilite,
          telephone: agent.telephone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de l\'agent')
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

  const handleFormationSaved = () => {
    // Rafraîchir les données de la page après l'ajout d'une formation
    router.refresh()
  }

  return (
    <ResizableTableWithToast
      className="mt-10"
      title="Agent"
      agents={agents}
      onAgentSelect={handleAgentSelect}
      onColumnResize={handleColumnResize}
      onSaveEdit={handleSaveEdit}
      onFormationSaved={handleFormationSaved}
      isUpdating={isUpdating}
    />
  )
}
