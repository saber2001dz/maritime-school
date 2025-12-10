"use client"

import { ServerManagementTable, Server } from "@/components/ui/server-management-table"
import { useRouter } from "next/navigation"

interface ListeFormationClientProps {
  initialFormations: Server[]
}

export function ListeFormationClient({ initialFormations }: ListeFormationClientProps) {
  const router = useRouter()

  return (
    <div className="pt-20">
      <ServerManagementTable
        servers={initialFormations}
        onAddNewFormation={() => router.push('/nouvelle-formarion')}
      />
    </div>
  )
}
