"use client"

import { ResizableTable, type Agent } from "@/components/ui/resizable-table"

interface ResizableTableWrapperProps {
  agents: Agent[]
}

export function ResizableTableWrapper({ agents }: ResizableTableWrapperProps) {
  const handleAgentSelect = (agentId: string) => {
    console.log(`Selected agent:`, agentId)
  }

  const handleColumnResize = (columnKey: string, newWidth: number) => {
    console.log(`Column ${columnKey} resized to ${newWidth}px`)
  }

  return (
    <ResizableTable
      className="mt-10"
      title="Agent"
      agents={agents}
      onAgentSelect={handleAgentSelect}
      onColumnResize={handleColumnResize}
    />
  )
}
