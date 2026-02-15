"use client"

import { useState } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import {
  Download,
  ChevronDown,
  Shield,
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
  category?: string
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
  const [showExportMenu, setShowExportMenu] = useState(false)
  const shouldReduceMotion = useReducedMotion()

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

  const exportToExcel = () => {
    const resourceKeys = Object.keys(resources)
    const excelData = initialRoles.map((role: Role) => {
      const row: Record<string, string | number> = {
        "Rôle": role.displayName,
        "Description": role.description,
        "Utilisateurs": role.userCount,
      }
      for (const resourceKey of resourceKeys) {
        const perms = role.permissions[resourceKey] || []
        const labels = resources[resourceKey]?.actionLabels || {}
        row[resources[resourceKey].name] = perms.length > 0
          ? perms.map((a) => labels[a] || a).join(", ")
          : "-"
      }
      return row
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Permissions")

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
      ...resourceKeys.map(() => ({ wch: 28 })),
    ]

    XLSX.writeFile(workbook, `permissions-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const getRoleColorClass = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string; header: string; check: string } } = {
      purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/20",
        header: "bg-purple-500/10 border-purple-500/20",
        check: "accent-purple-600",
      },
      blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20",
        header: "bg-blue-500/10 border-blue-500/20",
        check: "accent-blue-600",
      },
      indigo: {
        bg: "bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/30",
        header: "bg-orange-500/10 border-orange-500/30",
        check: "accent-orange-600",
      },
      teal: {
        bg: "bg-teal-500/10",
        text: "text-teal-600 dark:text-teal-400",
        border: "border-teal-500/30",
        header: "bg-teal-500/10 border-teal-500/30",
        check: "accent-teal-600",
      },
      orange: {
        bg: "bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/30",
        header: "bg-orange-500/10 border-orange-500/30",
        check: "accent-orange-600",
      },
      green: {
        bg: "bg-green-500/10",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-500/20",
        header: "bg-green-500/10 border-green-500/20",
        check: "accent-green-600",
      },
      gray: {
        bg: "bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
        border: "border-gray-500/20",
        header: "bg-gray-500/10 border-gray-500/20",
        check: "accent-gray-600",
      },
    }
    return colorMap[color] || colorMap.gray
  }

  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  }

  const cardVariants = {
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
  }

  // Séparer les ressources par catégorie
  const appResources = Object.entries(resources).filter(([, r]) => r.category === 'application')
  const adminResources = Object.entries(resources).filter(([, r]) => r.category === 'administration')
  const otherResources = Object.entries(resources).filter(([, r]) => !r.category || (r.category !== 'application' && r.category !== 'administration'))

  // Recueillir toutes les actions uniques par catégorie pour les en-têtes de colonnes
  const getAllActions = (entries: [string, Resource][]) => {
    const actionsSet = new Set<string>()
    entries.forEach(([, r]) => r.actions.forEach(a => actionsSet.add(a)))
    return Array.from(actionsSet)
  }

  // Render table for a group of resources
  const renderResourceTable = (
    entries: [string, Resource][],
    role: Role,
    colorClasses: ReturnType<typeof getRoleColorClass>
  ) => {
    if (entries.length === 0) return null

    // Collecter toutes les actions possibles dans ce groupe
    const allActions = getAllActions(entries)

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className={`border-b ${colorClasses.border}`}>
              <th className={`text-left py-2 px-3 font-medium text-xs uppercase tracking-wider ${colorClasses.text} w-40`}>
                Table
              </th>
              {allActions.map((action) => {
                // Trouver un label pour cette action depuis n'importe quelle ressource
                let label = action
                for (const [, res] of entries) {
                  if (res.actionLabels[action]) {
                    label = res.actionLabels[action]
                    break
                  }
                }
                return (
                  <th
                    key={action}
                    className={`text-center py-2 px-2 font-medium text-xs uppercase tracking-wider ${colorClasses.text} w-24`}
                  >
                    {label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {entries.map(([resourceKey, resource], idx) => {
              const rolePerms = role.permissions[resourceKey] || []
              return (
                <tr
                  key={resourceKey}
                  className={`border-b border-border/20 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'}`}
                >
                  <td className="py-2 px-3 font-medium text-foreground">
                    {resource.name}
                  </td>
                  {allActions.map((action) => {
                    const hasAction = resource.actions.includes(action)
                    const hasAccess = rolePerms.includes(action)

                    if (!hasAction) {
                      return (
                        <td key={action} className="text-center py-2 px-2 w-24">
                          <span className="text-muted-foreground/30">—</span>
                        </td>
                      )
                    }

                    return (
                      <td key={action} className="text-center py-2 px-2 w-24">
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          disabled={!onTogglePermission}
                          onChange={() => onTogglePermission?.(role.name, resourceKey, action)}
                          className={`w-4 h-4 rounded border-border/50 ${colorClasses.check} ${onTogglePermission ? 'cursor-pointer' : 'cursor-default'}`}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header avec actions */}
      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-2">
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
                    onClick={() => { exportToExcel(); setShowExportMenu(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/30 transition-colors"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => { exportToCSV(); setShowExportMenu(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/30 transition-colors border-t border-border/30"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => { exportToJSON(); setShowExportMenu(false) }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/30 transition-colors border-t border-border/30"
                  >
                    JSON
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Une carte par rôle */}
      <motion.div
        variants={shouldAnimate ? containerVariants : {}}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {initialRoles.map((role) => {
          const colorClasses = getRoleColorClass(role.color)

          return (
            <motion.div
              key={role.name}
              variants={shouldAnimate ? cardVariants : {}}
              className={`rounded-lg border ${colorClasses.border} overflow-hidden`}
            >
              {/* Header du rôle */}
              <div className={`flex items-center gap-3 px-5 py-4 ${colorClasses.bg} border-b ${colorClasses.border}`}>
                <Shield className={`w-5 h-5 ${colorClasses.text} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-base ${colorClasses.text}`}>
                    {role.displayName}
                  </h3>
                  {role.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{role.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Users className="w-3.5 h-3.5" />
                  <span>{role.userCount} utilisateur{role.userCount !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Corps : tables par catégorie */}
              <div className="bg-background">
                {/* Tables Application */}
                {appResources.length > 0 && (
                  <div>
                    <div className="px-5 py-2 bg-muted/20 border-b border-border/30">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tables Application
                      </span>
                    </div>
                    <div className="px-2 py-2">
                      {renderResourceTable(appResources, role, colorClasses)}
                    </div>
                  </div>
                )}


                {/* Autres */}
                {otherResources.length > 0 && (
                  <div className={(appResources.length > 0 || adminResources.length > 0) ? "border-t border-border/30" : ""}>
                    <div className="px-5 py-2 bg-muted/20 border-b border-border/30">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Autres
                      </span>
                    </div>
                    <div className="px-2 py-2">
                      {renderResourceTable(otherResources, role, colorClasses)}
                    </div>
                  </div>
                )}
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
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">À propos des permissions</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les permissions contrôlent l'accès aux différentes fonctionnalités
              de la plateforme. Elles sont organisées par ressources et par actions.
              {onTogglePermission && " Cochez ou décochez une case pour activer ou désactiver la permission."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
