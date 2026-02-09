"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Download,
  ChevronDown,
  Shield,
  Check,
  Users,
  Info,
} from "lucide-react"

export interface Role {
  name: string
  displayName: string
  description: string
  color: string
  permissions: {
    [resource: string]: string[]
  }
  userCount: number
}

export interface Resource {
  name: string
  description: string
  actions: string[]
  actionLabels: {
    [action: string]: string
  }
}

export interface Resources {
  [key: string]: Resource
}

interface PermissionsTableProps {
  roles?: Role[]
  resources?: Resources
  className?: string
  enableAnimations?: boolean
  onTogglePermission?: (roleName: string, resourceKey: string, action: string) => void
}

export function PermissionsTable({
  roles: initialRoles = [],
  resources = {},
  className = "",
  enableAnimations = true,
  onTogglePermission,
}: PermissionsTableProps) {
  const [mounted, setMounted] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  const exportToCSV = () => {
    const headers = ["Rôle", "Description", "Utilisateurs", ...Object.keys(resources).map((r) => resources[r].name)]
    const rows = initialRoles.map((role: Role) => {
      const resourcePermissions = Object.keys(resources).map((resourceKey) => {
        const perms = role.permissions[resourceKey] || []
        return perms.length > 0 ? perms.join("; ") : "Aucun"
      })
      return [
        role.displayName,
        role.description,
        role.userCount.toString(),
        ...resourcePermissions,
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `permissions-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToJSON = () => {
    const exportData = initialRoles.map((role) => ({
      role: role.displayName,
      description: role.description,
      userCount: role.userCount,
      permissions: role.permissions,
    }))
    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `permissions-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const getRoleColorClass = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/20",
      },
      blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20",
      },
      indigo: {
        bg: "bg-teal-500/10",
        text: "text-teal-600 dark:text-teal-400",
        border: "border-teal-500/30",
      },
      teal: {
        bg: "bg-teal-500/10",
        text: "text-teal-600 dark:text-teal-400",
        border: "border-teal-500/30",
      },
      orange: {
        bg: "bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/30",
      },
      green: {
        bg: "bg-green-500/10",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-500/20",
      },
      gray: {
        bg: "bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
        border: "border-gray-500/20",
      },
    }
    return colorMap[color] || colorMap.gray
  }

  const hasPermission = (role: Role, resource: string, action: string) => {
    return role.permissions[resource]?.includes(action) || false
  }

  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  }

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header avec actions */}
      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-2">
          {/* Bouton Exporter */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-32 bg-background border border-border/50 rounded-md shadow-lg z-50"
                >
                  <button
                    onClick={() => {
                      exportToCSV()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/30 transition-colors"
                  >
                    Exporter CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/30 transition-colors"
                  >
                    Exporter JSON
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Vue par rôle - Cartes des rôles */}
      <motion.div
        variants={shouldAnimate ? containerVariants : {}}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {initialRoles.map((role, idx) => {
          const colorClasses = getRoleColorClass(role.color)

          return (
            <motion.div
              key={role.name}
              variants={shouldAnimate ? rowVariants : {}}
              className={`p-5 rounded-lg border ${colorClasses.border} ${colorClasses.bg} backdrop-blur-sm`}
            >
              {/* Header du rôle */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className={`w-5 h-5 ${colorClasses.text}`} />
                    <h3 className={`font-semibold text-lg ${colorClasses.text}`}>
                      {role.displayName}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{role.userCount} utilisateur{role.userCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>

              {/* Matrice des permissions */}
              <div className="space-y-3">
                {Object.entries(resources).map(([resourceKey, resource]) => {
                  const rolePerms = role.permissions[resourceKey] || []

                  if (!onTogglePermission && rolePerms.length === 0) return null

                  return (
                    <div key={resourceKey} className="border-t border-border/30 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {resource.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {resource.actions.map((action) => {
                          const hasAccess = rolePerms.includes(action)

                          if (!onTogglePermission && !hasAccess) return null

                          return (
                            <button
                              key={action}
                              type="button"
                              disabled={!onTogglePermission}
                              onClick={() => onTogglePermission?.(role.name, resourceKey, action)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                hasAccess
                                  ? `${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`
                                  : "bg-muted/30 text-muted-foreground border border-border/20"
                              } ${onTogglePermission ? "cursor-pointer hover:opacity-80" : ""}`}
                            >
                              {hasAccess && <Check className="w-3 h-3" />}
                              {resource.actionLabels[action] || action}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Message si aucun résultat */}
      {initialRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aucun rôle trouvé</p>
        </div>
      )}

      {/* Légende */}
      <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
        <div className="flex items-start gap-2 mb-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">À propos des permissions</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les permissions contrôlent l'accès aux différentes fonctionnalités
              de la plateforme. Elles sont organisées par ressources et par actions.
              {onTogglePermission && " Cliquez sur une action pour activer ou désactiver la permission."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
