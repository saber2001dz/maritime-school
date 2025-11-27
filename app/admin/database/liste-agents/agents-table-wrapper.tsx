"use client"

import { AgentsTable, type Agent } from "./agents-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface AgentsTableWrapperProps {
  agents: Agent[]
}

export function AgentsTableWrapper({ agents }: AgentsTableWrapperProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSaveEdit = async (agent: Agent): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomPrenom: agent.nomPrenom,
          grade: agent.grade,
          matricule: agent.matricule,
          responsabilite: agent.responsabilite,
          telephone: agent.telephone,
          categorie: agent.categorie,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour de l'agent")
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

  const handleDeleteAgent = async (agentId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'agent")
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
    <AgentsTable
      agents={agents}
      onSaveEdit={handleSaveEdit}
      onDeleteAgent={handleDeleteAgent}
      isUpdating={isUpdating}
    />
  )
}
