"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface RoleFormData {
  name: string
  displayName: string
  description: string
  color: string
}

interface DialogueEditRoleProps {
  isOpen: boolean
  onClose: () => void
  role?: RoleFormData | null
  isSystem?: boolean
  onSave: (data: RoleFormData) => Promise<{ success: boolean; error?: string }>
  onDelete?: (name: string) => Promise<{ success: boolean; error?: string }>
  isUpdating?: boolean
}

const COLOR_OPTIONS = [
  { value: "purple", label: "Violet", bgClass: "bg-purple-500" },
  { value: "blue", label: "Bleu", bgClass: "bg-blue-500" },
  { value: "green", label: "Vert", bgClass: "bg-green-500" },
  { value: "gray", label: "Gris", bgClass: "bg-gray-500" },
  { value: "red", label: "Rouge", bgClass: "bg-red-500" },
  { value: "orange", label: "Orange", bgClass: "bg-orange-500" },
  { value: "yellow", label: "Jaune", bgClass: "bg-yellow-500" },
  { value: "cyan", label: "Cyan", bgClass: "bg-cyan-500" },
]

export function DialogueEditRole({
  isOpen,
  onClose,
  role,
  isSystem = false,
  onSave,
  onDelete,
  isUpdating = false,
}: DialogueEditRoleProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    displayName: "",
    description: "",
    color: "gray",
  })
  const [error, setError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEditing = !!role

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        color: role.color,
      })
    } else {
      setFormData({ name: "", displayName: "", description: "", color: "gray" })
    }
    setError("")
    setConfirmDelete(false)
  }, [role, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim() || !formData.displayName.trim()) {
      setError("Le nom et le nom d'affichage sont requis")
      return
    }

    const result = await onSave(formData)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Erreur lors de la sauvegarde")
    }
  }

  const handleDelete = async () => {
    if (!role || !onDelete) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    const result = await onDelete(role.name)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Erreur lors de la suppression")
    }
  }

  const handleClose = () => {
    setError("")
    setConfirmDelete(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-lg shadow-lg z-50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isEditing ? "Modifier le role" : "Creer un role"}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">Identifiant (nom technique)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="ex: superviseur"
                  disabled={isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">L'identifiant ne peut pas etre modifie</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Nom d'affichage</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="ex: Superviseur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="ex: Supervise les operations"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Couleur</label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger className="w-full h-[42px]!">
                    <SelectValue placeholder="Selectionner une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${option.bgClass}`} />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                {isEditing && onDelete && !isSystem && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className={`px-4 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 text-sm ${
                      confirmDelete
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    }`}
                    disabled={isUpdating}
                  >
                    <Trash2 size={14} />
                    {confirmDelete ? "Confirmer" : "Supprimer"}
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
                  disabled={isUpdating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
