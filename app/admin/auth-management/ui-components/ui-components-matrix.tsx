"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Download,
  ChevronDown,
  Check,
  Info,
  Square,
  Upload,
  Edit,
  Filter,
  Printer,
  BarChart,
  Move,
  Calendar,
  FileText,
  PieChart,
} from "lucide-react"

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

interface UIComponentsMatrixProps {
  componentsByCategory: Record<string, UIComponent[]>
  roles: Role[]
  onTogglePermission?: (componentId: string, roleId: string, category: string) => void
}

// Map icon names to components
const iconMap: Record<string, any> = {
  Download,
  Upload,
  Edit,
  Filter,
  Printer,
  BarChart,
  Move,
  Calendar,
  FileText,
  PieChart,
  Square,
}

export function UIComponentsMatrix({
  componentsByCategory,
  roles,
  onTogglePermission,
}: UIComponentsMatrixProps) {
  const [mounted, setMounted] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  const getRoleColorClass = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/30",
        hover: "hover:bg-purple-500/20",
      },
      blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/30",
        hover: "hover:bg-blue-500/20",
      },
      teal: {
        bg: "bg-teal-500/10",
        text: "text-teal-600 dark:text-teal-400",
        border: "border-teal-500/30",
        hover: "hover:bg-teal-500/20",
      },
      orange: {
        bg: "bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/30",
        hover: "hover:bg-orange-500/20",
      },
      green: {
        bg: "bg-green-500/10",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-500/30",
        hover: "hover:bg-green-500/20",
      },
      gray: {
        bg: "bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
        border: "border-gray-500/30",
        hover: "hover:bg-gray-500/20",
      },
    }
    return colorMap[color] || colorMap.gray
  }

  const exportToCSV = () => {
    const allComponents = Object.entries(componentsByCategory).flatMap(([category, components]) =>
      components.map(c => ({ ...c, category }))
    )

    const headers = ["Catégorie", "Composant", ...roles.map(r => r.displayName)]
    const rows = allComponents.map(component => {
      const permissions = roles.map(role => (component.permissions[role.id] ? "✓" : "✗"))
      return [component.category, component.displayName, ...permissions]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `ui-components-permissions-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const categories = Object.keys(componentsByCategory).sort()

  return (
    <div className="w-full">
      {/* Header with export */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {categories.length} catégories • {Object.values(componentsByCategory).flat().length} composants
        </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-sm border-r border-border/50 sticky left-0 bg-muted/50 z-10 min-w-[250px]">
                  Composant UI
                </th>
                {roles.map(role => {
                  const colorClasses = getRoleColorClass(role.color)
                  return (
                    <th
                      key={role.id}
                      className={`px-4 py-3 text-center font-semibold text-sm border-r border-border/50 last:border-r-0 w-[200px] ${colorClasses.text}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{role.displayName}</span>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, categoryIdx) => (
                <React.Fragment key={`category-${category}`}>
                  {/* Category header row */}
                  <tr className="bg-muted/30">
                    <td
                      colSpan={roles.length + 1}
                      className="px-4 py-2 font-semibold text-sm border-t border-border/50"
                    >
                      📁 {category}
                    </td>
                  </tr>

                  {/* Component rows */}
                  {componentsByCategory[category].map((component, componentIdx) => {
                    const IconComponent = iconMap[component.icon] || Square

                    return (
                      <motion.tr
                        key={component.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (categoryIdx * 0.05) + (componentIdx * 0.02) }}
                        className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        {/* Component name */}
                        <td className="px-4 py-3 border-r border-border/50 sticky left-0 bg-background hover:bg-muted/20 z-10">
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{component.displayName}</div>
                              <div className="text-xs text-muted-foreground">{component.description}</div>
                            </div>
                          </div>
                        </td>

                        {/* Permission checkboxes for each role */}
                        {roles.map(role => {
                          const isEnabled = component.permissions[role.id] || false
                          const colorClasses = getRoleColorClass(role.color)

                          return (
                            <td
                              key={role.id}
                              className="px-4 py-3 text-center border-r border-border/50 last:border-r-0"
                            >
                              <button
                                type="button"
                                disabled={!onTogglePermission}
                                onClick={() => onTogglePermission?.(component.id, role.id, category)}
                                className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isEnabled
                                    ? `${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}`
                                    : "bg-transparent border-border/50 text-muted-foreground"
                                } ${onTogglePermission ? `cursor-pointer ${colorClasses.hover}` : "cursor-not-allowed"}`}
                              >
                                {isEnabled && <Check className="w-4 h-4" />}
                              </button>
                            </td>
                          )
                        })}
                      </motion.tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">À propos des composants UI</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les composants UI contrôlent l'accès aux fonctionnalités spécifiques de l'interface (boutons d'export,
              filtres avancés, drag & drop, etc.). Ils sont organisés par page pour une gestion simplifiée.
              {onTogglePermission && " Cliquez sur une case pour activer ou désactiver l'accès."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
