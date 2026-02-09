"use client"

import { useState } from "react"
import { RolesTable, type Role, type SimpleUser } from "./roles-table"
import type { RoleFormData } from "./dialogue-edit-role"
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

  const handleCreateRole = async (data: RoleFormData): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors de la creation du role")
      }

      addToast({
        variant: "success",
        title: "Succes",
        description: "Le role a ete cree avec succes",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors de la creation du role:", error)

      addToast({
        variant: "error",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la creation du role",
      })

      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la creation" }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditRole = async (data: RoleFormData): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      // Find the role ID by name
      const rolesResponse = await fetch("/api/roles")
      const rolesData = await rolesResponse.json()
      const role = rolesData.find((r: any) => r.name === data.name)

      if (!role) {
        throw new Error("Role non trouve")
      }

      const response = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          description: data.description,
          color: data.color,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors de la modification du role")
      }

      addToast({
        variant: "success",
        title: "Succes",
        description: "Le role a ete modifie avec succes",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors de la modification du role:", error)

      addToast({
        variant: "error",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la modification du role",
      })

      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la modification" }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteRole = async (name: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      // Find the role ID by name
      const rolesResponse = await fetch("/api/roles")
      const rolesData = await rolesResponse.json()
      const role = rolesData.find((r: any) => r.name === name)

      if (!role) {
        throw new Error("Role non trouve")
      }

      const response = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Erreur lors de la suppression du role")
      }

      addToast({
        variant: "success",
        title: "Succes",
        description: "Le role a ete supprime avec succes",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors de la suppression du role:", error)

      addToast({
        variant: "error",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du role",
      })

      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la suppression" }
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
      onCreateRole={handleCreateRole}
      onEditRole={handleEditRole}
      onDeleteRole={handleDeleteRole}
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
