"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import CoursSimpleTable, { SimpleCours } from "@/components/ui/cours-simple-table"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"
import DialogueCours, { type CoursData } from "@/components/dialogue-cours"
import { can } from "@/lib/permissions"
import { usePermissions } from "@/lib/permissions-context"
import { useUIPermissions } from "@/lib/ui-permissions-context"
import { canAccessUIComponent } from "@/lib/ui-permissions"

interface Cours {
  id: string
  titre: string
  createdAt: Date
  updatedAt: Date
}

interface CoursTableWrapperProps {
  cours: Cours[]
  userRole?: string | null
  userRoleId?: string | null
}

function CoursTableWrapperContent({ cours: initialCours, userRole, userRoleId }: CoursTableWrapperProps) {
  const permissionsMap = usePermissions()
  const uiPermissionsMap = useUIPermissions()
  const canEditButton = canAccessUIComponent(userRoleId ?? null, "cours_edit_button", uiPermissionsMap)
  const router = useRouter()
  const [cours, setCours] = useState<SimpleCours[]>(
    initialCours.map((item, index) => ({
      id: item.id,
      number: String(index + 1).padStart(2, "0"), // Format: "01", "02", "03"...
      titre: item.titre,
    }))
  )
  const [editingCours, setEditingCours] = useState<CoursData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { addToast } = useToast()

  const handleEditClick = (coursItem: SimpleCours) => {
    const coursData: CoursData = {
      id: coursItem.id,
      titre: coursItem.titre,
    }
    setEditingCours(coursData)
  }

  const handleSaveCours = async (data: CoursData) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/cours/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: data.titre.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      // Mettre à jour l'état local
      setCours((prevCours) =>
        prevCours.map((c) =>
          c.id === data.id
            ? {
                ...c,
                titre: data.titre,
              }
            : c
        )
      )

      // Afficher le toast de succès
      addToast({
        variant: "success",
        title: "نجـاح العمليـة",
        description: "تم حفظ البيانات بنجاح",
      })

      // Fermer le dialogue
      setEditingCours(null)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)

      // Afficher le toast d'erreur
      addToast({
        variant: "error",
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ البيانات",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCloseDialog = () => {
    setEditingCours(null)
  }

  const handleDeleteCours = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/cours/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      // Mettre à jour l'état local - supprimer le cours et réorganiser les numéros
      setCours((prevCours) => {
        const filteredCours = prevCours.filter((c) => c.id !== id)
        // Réassigner les numéros après suppression
        return filteredCours.map((c, index) => ({
          ...c,
          number: String(index + 1).padStart(2, "0"),
        }))
      })

      // Afficher le toast de succès
      addToast({
        variant: "success",
        title: "نجـاح العمليـة",
        description: "تم حذف الدرس بنجاح",
      })

      // Fermer le dialogue
      setEditingCours(null)
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)

      // Afficher le toast d'erreur
      addToast({
        variant: "error",
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حذف الدرس",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddNewCours = () => {
    router.push("/nouveau-cours")
  }

  return (
    <div className="w-full mt-4">
      <CoursSimpleTable
        cours={cours}
        onEditClick={can(userRole, "cours", "edit", permissionsMap) ? handleEditClick : undefined}
        canEditButton={canEditButton}
        onAddNewCours={can(userRole, "cours", "create", permissionsMap) ? handleAddNewCours : undefined}
        countText={`عدد الدروس: ${cours.length}`}
      />

      {/* Dialogue d'édition de cours */}
      <AnimatePresence mode="wait">
        {editingCours && (
          <DialogueCours
            cours={editingCours}
            isOpen={true}
            onClose={handleCloseDialog}
            onSave={handleSaveCours}
            onDelete={can(userRole, "cours", "delete", permissionsMap) ? handleDeleteCours : undefined}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CoursTableWrapper(props: CoursTableWrapperProps) {
  return (
    <ToastProvider>
      <CoursTableWrapperContent {...props} />
    </ToastProvider>
  )
}
