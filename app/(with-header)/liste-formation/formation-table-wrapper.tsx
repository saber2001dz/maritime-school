"use client"

import { ServerManagementTable, Server } from "@/components/ui/server-management-table"
import { useRouter } from "next/navigation"
import { can } from "@/lib/permissions"
import { usePermissions } from "@/lib/permissions-context"

interface FormationTableWrapperProps {
  formations: Server[]
  userRole?: string | null
}

export function FormationTableWrapper({ formations, userRole }: FormationTableWrapperProps) {
  const permissionsMap = usePermissions()
  const router = useRouter()

  return (
    <div className="pt-20">
      <ServerManagementTable
        servers={formations}
        onAddNewFormation={can(userRole, "formation", "create", permissionsMap) ? () => router.push('/nouvelle-formarion') : undefined}
        userRole={userRole}
      />
    </div>
  )
}
