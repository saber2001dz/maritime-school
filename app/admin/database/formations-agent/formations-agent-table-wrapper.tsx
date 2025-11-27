"use client"

import { FormationsAgentTable, type AgentFormationWithRelations } from "./formations-agent-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface FormationsAgentTableWrapperProps {
  agentFormations: AgentFormationWithRelations[]
}

export function FormationsAgentTableWrapper({ agentFormations }: FormationsAgentTableWrapperProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSaveEdit = async (agentFormation: AgentFormationWithRelations): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/agent-formations/${agentFormation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formationId: agentFormation.formationId,
          dateDebut: agentFormation.dateDebut,
          dateFin: agentFormation.dateFin,
          reference: agentFormation.reference,
          resultat: agentFormation.resultat,
          moyenne: agentFormation.moyenne,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour de la formation agent")
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

  const handleDeleteAgentFormation = async (agentFormationId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/agent-formations/${agentFormationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la formation agent")
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
    <FormationsAgentTable
      agentFormations={agentFormations}
      onSaveEdit={handleSaveEdit}
      onDeleteAgentFormation={handleDeleteAgentFormation}
      isUpdating={isUpdating}
    />
  )
}
