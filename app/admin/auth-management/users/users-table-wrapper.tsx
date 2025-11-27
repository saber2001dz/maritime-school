"use client"

import { useState } from "react"
import { UsersTable, type User } from "./users-table"
import { useRouter } from "next/navigation"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"
import type { Role } from "@/lib/roles"

interface RoleWithCount extends Role {
  userCount: number
}

interface UsersTableWrapperProps {
  users: User[]
  roles: RoleWithCount[]
}

function UsersTableWrapperContent({ users: initialUsers, roles }: UsersTableWrapperProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  const handleSaveEdit = async (updatedUser: User): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/users/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          emailVerified: updatedUser.emailVerified,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      const data = await response.json()

      // Afficher le toast de succès
      addToast({
        variant: "success",
        title: "Succès",
        description: "L'utilisateur a été modifié avec succès",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)

      // Afficher le toast d'erreur
      addToast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification",
      })

      return { success: false, error: "Erreur lors de la mise à jour" }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      // Afficher le toast de succès
      addToast({
        variant: "success",
        title: "Succès",
        description: "L'utilisateur a été supprimé avec succès",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)

      // Afficher le toast d'erreur
      addToast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression",
      })

      return { success: false, error: "Erreur lors de la suppression" }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddUser = async (data: {
    email: string
    name: string
    password: string
    role: string
    emailVerified: boolean
  }): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création")
      }

      // Afficher le toast de succès
      addToast({
        variant: "success",
        title: "Succès",
        description: "L'utilisateur a été créé avec succès",
      })

      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Erreur lors de la création:", error)

      // Afficher le toast d'erreur
      addToast({
        variant: "error",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la création",
      })

      return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la création" }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleKillSession = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/users/kill-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la terminaison de la session")
      }

      const data = await response.json()

      // Afficher le toast de succès
      addToast({
        variant: "success",
        title: "Succès",
        description: data.message || "La session de l'utilisateur a été terminée avec succès",
      })

      // Rafraîchir les données pour mettre à jour le statut de session
      router.refresh()

      return { success: true }
    } catch (error) {
      console.error("Erreur lors de la terminaison de la session:", error)

      // Afficher le toast d'erreur
      addToast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la terminaison de la session",
      })

      return { success: false, error: "Erreur lors de la terminaison de la session" }
    }
  }

  return (
    <UsersTable
      users={initialUsers}
      roles={roles}
      onSaveEdit={handleSaveEdit}
      onDeleteUser={handleDeleteUser}
      onAddUser={handleAddUser}
      onKillSession={handleKillSession}
      isUpdating={isUpdating}
    />
  )
}

export function UsersTableWrapper(props: UsersTableWrapperProps) {
  return (
    <ToastProvider>
      <UsersTableWrapperContent {...props} />
    </ToastProvider>
  )
}
