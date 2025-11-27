"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2 } from "lucide-react"
import { SimpleUser } from "./roles-table"

interface DialogueViewUsersProps {
  isOpen: boolean
  onClose: () => void
  roleName: string
  roleDisplayName: string
  users: SimpleUser[]
  onRemoveRole?: (userId: string) => Promise<{ success: boolean; error?: string }>
}

export function DialogueViewUsers({
  isOpen,
  onClose,
  roleName,
  roleDisplayName,
  users,
  onRemoveRole,
}: DialogueViewUsersProps) {
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const filteredUsers = users.filter((user) => user.role === roleName)

  const handleRemoveRole = async (userId: string) => {
    if (!onRemoveRole) return

    setRemovingUserId(userId)
    setError("")

    try {
      const result = await onRemoveRole(userId)

      if (!result.success) {
        setError(result.error || "Erreur lors du retrait du role")
      }
    } catch (error) {
      console.error("Erreur lors du retrait du role:", error)
      setError("Une erreur s'est produite lors du retrait du role")
    } finally {
      setRemovingUserId(null)
    }
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
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg z-50 p-6 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Utilisateurs - {roleDisplayName} ({filteredUsers.length})
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur avec ce role
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm">{user.name || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveRole(user.id)}
                              disabled={removingUserId === user.id}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              title="Retirer le role (devient agent)"
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
