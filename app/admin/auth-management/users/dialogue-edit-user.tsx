"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, LogOut } from "lucide-react"
import { User } from "./users-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Role } from "@/lib/roles"

interface RoleWithCount extends Role {
  userCount: number
}

interface DialogueEditUserProps {
  user: User | null
  roles: RoleWithCount[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<User>) => Promise<void>
  onKillSession?: (userId: string) => Promise<{ success: boolean; error?: string }>
}

export function DialogueEditUser({ user, roles, isOpen, onClose, onSave, onKillSession }: DialogueEditUserProps) {
  const [formData, setFormData] = useState({
    email: user?.email ?? "",
    name: user?.name ?? "",
    password: "",
    confirmPassword: "",
    role: user?.role ?? "agent",
    emailVerified: user?.emailVerified ?? false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isKillingSession, setIsKillingSession] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation du mot de passe seulement s'il est rempli
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas")
        return
      }

      if (formData.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères")
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Préparer les données à envoyer (ne pas inclure password si vide)
      const dataToSave: Partial<User> = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        emailVerified: formData.emailVerified,
      }

      await onSave(dataToSave)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      setError("Une erreur s'est produite lors de la modification de l'utilisateur")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const handleKillSession = async () => {
    if (!user || !onKillSession) return

    setIsKillingSession(true)
    setError("")

    try {
      const result = await onKillSession(user.id)

      if (!result.success) {
        setError(result.error || "Erreur lors de la terminaison de la session")
      }
    } catch (error) {
      console.error("Erreur lors de la terminaison de la session:", error)
      setError("Une erreur s'est produite lors de la terminaison de la session")
    } finally {
      setIsKillingSession(false)
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-lg shadow-lg z-50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "#06407F" }}>Modifier l'utilisateur</h2>
              <button
                onClick={onClose}
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
                <label className="block text-sm font-medium mb-1.5">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Nom de l'utilisateur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.email.replace("@maritime.gn", "")}
                    onChange={(e) => {
                      const username = e.target.value.replace(/@.*$/, "")
                      handleChange("email", username + "@maritime.gn")
                    }}
                    className="w-full px-3 py-2 pr-32 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="utilisateur"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                    @maritime.gn
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Nouveau mot de passe (optionnel)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Laisser vide pour ne pas changer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Confirmer le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Rôle</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                >
                  <SelectTrigger className="w-full h-[42px]!">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...roles].sort((a, b) => {
                      const order = ["administrateur", "coordinateur", "formateur", "direction", "agent"]
                      const aIdx = order.indexOf(a.name)
                      const bIdx = order.indexOf(b.name)
                      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
                    }).map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              role.color === "purple"
                                ? "bg-purple-500"
                                : role.color === "blue"
                                ? "bg-blue-500"
                                : role.color === "green"
                                ? "bg-green-500"
                                : role.color === "orange"
                                ? "bg-orange-500"
                                : role.color === "indigo"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                            }`}
                          />
                          <span>{role.displayName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailVerified-edit"
                  checked={formData.emailVerified}
                  onChange={(e) => handleChange("emailVerified", e.target.checked)}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                  style={{ accentColor: "#52525b" }}
                />
                <label htmlFor="emailVerified-edit" className="text-sm font-medium cursor-pointer">
                  Email vérifié
                </label>
              </div>

              {onKillSession && (
                <div className="pt-2 pb-2 border-t border-border">
                  <button
                    type="button"
                    onClick={handleKillSession}
                    disabled={isKillingSession || isSubmitting || !user?.hasActiveSession}
                    className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    {isKillingSession ? "Terminaison en cours..." : "Terminer la session"}
                  </button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {user?.hasActiveSession
                      ? "Déconnecte l'utilisateur de toutes ses sessions actives"
                      : "Aucune session active"}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
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
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
