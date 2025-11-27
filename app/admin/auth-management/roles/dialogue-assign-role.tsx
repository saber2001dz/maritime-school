"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { SimpleUser, Role } from "./roles-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DialogueAssignRoleProps {
  isOpen: boolean
  onClose: () => void
  users: SimpleUser[]
  roles: Role[]
  onAssignRole?: (userId: string, role: string) => Promise<{ success: boolean; error?: string }>
}

export function DialogueAssignRole({ isOpen, onClose, users, roles, onAssignRole }: DialogueAssignRoleProps) {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedUserId || !selectedRole) {
      setError("Veuillez selectionner un utilisateur et un role")
      return
    }

    if (!onAssignRole) return

    setIsSubmitting(true)

    try {
      const result = await onAssignRole(selectedUserId, selectedRole)

      if (result.success) {
        setSelectedUserId("")
        setSelectedRole("")
        onClose()
      } else {
        setError(result.error || "Erreur lors de l'assignation du role")
      }
    } catch (error) {
      console.error("Erreur lors de l'assignation du role:", error)
      setError("Une erreur s'est produite lors de l'assignation du role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedUserId("")
    setSelectedRole("")
    setError("")
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
              <h2 className="text-lg font-semibold">Assigner un role</h2>
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
                <label className="block text-sm font-medium mb-1.5">Utilisateur</label>
                <Select
                  value={selectedUserId}
                  onValueChange={(value) => {
                    setSelectedUserId(value)
                    setError("")
                  }}
                >
                  <SelectTrigger className="w-full h-[42px]!">
                    <SelectValue placeholder="Selectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => {
                    setSelectedRole(value)
                    setError("")
                  }}
                >
                  <SelectTrigger className="w-full h-[42px]!">
                    <SelectValue placeholder="Selectionner un role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Assignation..." : "Assigner"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
