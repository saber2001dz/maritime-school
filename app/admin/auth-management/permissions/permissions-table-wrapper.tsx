"use client"

import { PermissionsTable, type Role, type Resources } from "@/components/ui/permissions-table"
import { ToastProvider } from "@/components/ui/ultra-quality-toast"

interface PermissionsTableWrapperProps {
  roles: Role[]
  resources: Resources
}

function PermissionsTableWrapperContent({ roles, resources }: PermissionsTableWrapperProps) {
  return (
    <PermissionsTable
      roles={roles}
      resources={resources}
    />
  )
}

export function PermissionsTableWrapper(props: PermissionsTableWrapperProps) {
  return (
    <ToastProvider>
      <PermissionsTableWrapperContent {...props} />
    </ToastProvider>
  )
}
