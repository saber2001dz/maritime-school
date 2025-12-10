"use client"

import { ServerManagementTable, Server } from "@/components/ui/server-management-table"
import { useRouter } from "next/navigation"

interface FormationTableWrapperProps {
  formations: Server[]
}

export function FormationTableWrapper({ formations }: FormationTableWrapperProps) {
  const router = useRouter()

  return (
    <div className="pt-20">
      <ServerManagementTable
        servers={formations}
        onAddNewFormation={() => router.push('/nouvelle-formarion')}
      />
    </div>
  )
}
