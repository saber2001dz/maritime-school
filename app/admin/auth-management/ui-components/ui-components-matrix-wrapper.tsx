"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UIComponentsMatrix } from "./ui-components-matrix"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"

interface Role {
  id: string
  name: string
  displayName: string
  color: string
}

interface UIComponent {
  id: string
  name: string
  displayName: string
  description: string
  icon: string
  permissions: Record<string, boolean> // roleId -> enabled
}

interface UIComponentsMatrixWrapperProps {
  componentsByCategory: Record<string, UIComponent[]>
  roles: Role[]
}

function UIComponentsMatrixWrapperContent({
  componentsByCategory: initialComponents,
  roles,
}: UIComponentsMatrixWrapperProps) {
  const [componentsByCategory, setComponentsByCategory] = useState(initialComponents)
  const router = useRouter()
  const { addToast } = useToast()

  const handleTogglePermission = async (componentId: string, roleId: string, category: string) => {
    // Get current state
    const component = componentsByCategory[category]?.find(c => c.id === componentId)
    if (!component) return

    const currentValue = component.permissions[roleId] || false
    const newValue = !currentValue

    // Optimistic update
    setComponentsByCategory(prev => ({
      ...prev,
      [category]: prev[category].map(c =>
        c.id === componentId
          ? {
              ...c,
              permissions: {
                ...c.permissions,
                [roleId]: newValue,
              },
            }
          : c
      ),
    }))

    try {
      const response = await fetch("/api/ui-components/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId,
          componentId,
          enabled: newValue,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      // Pas de toast pour les succès - l'UI est déjà mise à jour via optimistic update
      router.refresh()
    } catch (error) {
      // Revert optimistic update
      setComponentsByCategory(prev => ({
        ...prev,
        [category]: prev[category].map(c =>
          c.id === componentId
            ? {
                ...c,
                permissions: {
                  ...c.permissions,
                  [roleId]: currentValue,
                },
              }
            : c
        ),
      }))

      addToast({
        variant: "error",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour de la permission",
      })
    }
  }

  return (
    <UIComponentsMatrix
      componentsByCategory={componentsByCategory}
      roles={roles}
      onTogglePermission={handleTogglePermission}
    />
  )
}

export function UIComponentsMatrixWrapper(props: UIComponentsMatrixWrapperProps) {
  return (
    <ToastProvider>
      <UIComponentsMatrixWrapperContent {...props} />
    </ToastProvider>
  )
}
