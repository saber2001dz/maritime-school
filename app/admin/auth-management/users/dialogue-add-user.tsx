"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff } from "lucide-react"
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

interface DialogueAddUserProps {
  roles: RoleWithCount[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    email: string
    name: string
    password: string
    role: string
    emailVerified: boolean
  }) => Promise<void>
}

export function DialogueAddUser({ roles, isOpen, onClose, onSave }: DialogueAddUserProps) {
  const [formData, setFormData] = useState({
    email: "@maritime.gn",
    name: "",
    password: "",
    confirmPassword: "",
    role: "agent",
    emailVerified: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        role: formData.role,
        emailVerified: formData.emailVerified,
      })

      // Réinitialiser le formulaire
      setFormData({
        email: "@maritime.gn",
        name: "",
        password: "",
        confirmPassword: "",
        role: "agent",
        emailVerified: false,
      })
      onClose()
    } catch (error) {
      // Ne pas afficher l'erreur ici car elle est déjà affichée dans le Toast
      console.error("Erreur lors de la sauvegarde:", error)
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

  const handleCloseDialog = () => {
    setFormData({
      email: "@maritime.gn",
      name: "",
      password: "",
      confirmPassword: "",
      role: "agent",
      emailVerified: false,
    })
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
            onClick={handleCloseDialog}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-lg shadow-lg z-50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Ajouter un utilisateur</h2>
              <button
                onClick={handleCloseDialog}
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
                <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Minimum 6 caractères"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Confirmation mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Confirmez le mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {roles.map((role) => (
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
                  id="emailVerified"
                  checked={formData.emailVerified}
                  onChange={(e) => handleChange("emailVerified", e.target.checked)}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                  style={{ accentColor: "#52525b" }}
                />
                <label htmlFor="emailVerified" className="text-sm font-medium cursor-pointer">
                  Email vérifié
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDialog}
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
                  {isSubmitting ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
