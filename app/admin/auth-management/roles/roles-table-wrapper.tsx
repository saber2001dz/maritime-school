"use client"

import { useState } from "react"
import { RolesTable, type Role, type SimpleUser } from "./roles-table"
import { useRouter } from "next/navigation"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"

interface RolesTableWrapperProps {
  roles: Role[]
  users: SimpleUser[]
}

function RolesTableWrapperContent({ roles: initialRoles, users }: RolesTableWrapperProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  const handleAssignRole = async (userId: string, role: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'assignation du role")
      }

      addToast({
        variant: "success",
        title: "Succes",
        description: "Le role a ete assigne avec succes",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors de l'assignation du role:", error)

      addToast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'assignation du role",
      })

      return { success: false, error: "Erreur lors de l'assignation du role" }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveRole = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "agent" }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors du retrait du role")
      }

      addToast({
        variant: "success",
        title: "Succes",
        description: "Le role a ete retire avec succes (role par defaut: agent)",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors du retrait du role:", error)

      addToast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur s'est produite lors du retrait du role",
      })

      return { success: false, error: "Erreur lors du retrait du role" }
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <RolesTable
      roles={initialRoles}
      users={users}
      onAssignRole={handleAssignRole}
      onRemoveRole={handleRemoveRole}
      isUpdating={isUpdating}
    />
  )
}

export default function RolesTableWrapper(props: RolesTableWrapperProps) {
  return (
    <ToastProvider>
      <RolesTableWrapperContent {...props} />
    </ToastProvider>
  )
}
