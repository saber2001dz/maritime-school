"use client"

import { ResizableTableWithToast, type Agent } from "@/components/ui/resizable-table"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface ResizableTableWrapperProps {
  agents: Agent[]
  userRole?: string | null
}

export function ResizableTableWrapper({ agents, userRole }: ResizableTableWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAgentSelect = (agentId: string) => {
    console.log(`Selected agent:`, agentId)
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
      title="Agent"
      agents={agents}
      onAgentSelect={handleAgentSelect}
      onSaveEdit={handleSaveEdit}
      onFormationSaved={handleFormationSaved}
      isUpdating={isUpdating}
      onAddNewAgent={() => router.push('/nouveau-agent')}
      searchParams={searchParams}
      userRole={userRole}
    />
  )
}
