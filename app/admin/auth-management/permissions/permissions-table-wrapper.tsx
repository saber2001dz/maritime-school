"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PermissionsTable, type Role, type Resources } from "@/components/ui/permissions-table"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"

interface PermissionsTableWrapperProps {
  roles: Role[]
  resources: Resources
}

function PermissionsTableWrapperContent({ roles: initialRoles, resources }: PermissionsTableWrapperProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const router = useRouter()
  const { addToast } = useToast()

  const handleTogglePermission = async (roleName: string, resourceKey: string, action: string) => {
    // Optimistic update
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.name !== roleName) return role
        const currentActions = role.permissions[resourceKey] || []
        const newActions = currentActions.includes(action)
          ? currentActions.filter((a) => a !== action)
          : [...currentActions, action]
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [resourceKey]: newActions,
          },
        }
      })
    )

    try {
      const response = await fetch("/api/role-permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName, resourceName: resourceKey, action }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise a jour")
      }

      router.refresh()
    } catch (error) {
      // Revert optimistic update
      setRoles((prevRoles) =>
        prevRoles.map((role) => {
          if (role.name !== roleName) return role
          const currentActions = role.permissions[resourceKey] || []
          const newActions = currentActions.includes(action)
            ? currentActions.filter((a) => a !== action)
            : [...currentActions, action]
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [resourceKey]: newActions,
            },
          }
        })
      )

      addToast({
        variant: "error",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise a jour des permissions",
      })
    }
  }

  return (
    <PermissionsTable
      roles={roles}
      resources={resources}
      onTogglePermission={handleTogglePermission}
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
