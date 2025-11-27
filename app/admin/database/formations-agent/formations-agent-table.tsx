"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Download,
  ChevronDown,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  User,
  BookOpen,
  Hash,
  Award,
  TrendingUp,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DialogueEditAgentFormation } from "./dialogue-edit-agent-formation"

export interface AgentFormationWithRelations {
  id: string
  agentId: string
  formationId: string
  dateDebut: string
  dateFin: string
  reference?: string | null
  resultat?: string | null
  moyenne: number
  createdAt: Date | string
  updatedAt: Date | string
  agent: {
    id: string
    nomPrenom: string
    grade: string
  }
  formation: {
    id: string
    formation: string
  }
}

interface FormationsAgentTableProps {
  agentFormations?: AgentFormationWithRelations[]
  onAgentFormationSelect?: (agentFormationId: string) => void
  className?: string
  enableAnimations?: boolean
  onSaveEdit?: (agentFormation: AgentFormationWithRelations) => Promise<{ success: boolean; error?: string }>
  onDeleteAgentFormation?: (agentFormationId: string) => Promise<{ success: boolean; error?: string }>
  isUpdating?: boolean
}

type SortField = "agentName" | "formationName" | "dateDebut" | "dateFin" | "moyenne" | "createdAt" | "updatedAt"
type SortOrder = "asc" | "desc"

export function FormationsAgentTable({
  agentFormations: initialAgentFormations = [],
  onAgentFormationSelect,
  className = "",
  enableAnimations = true,
  onSaveEdit,
  onDeleteAgentFormation,
  isUpdating = false,
}: FormationsAgentTableProps) {
  const [selectedAgentFormations, setSelectedAgentFormations] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentFormationToDelete, setAgentFormationToDelete] = useState<AgentFormationWithRelations | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [agentFormationToEdit, setAgentFormationToEdit] = useState<AgentFormationWithRelations | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAgentFormationSelect = (agentFormationId: string) => {
    setSelectedAgentFormations((prev) => {
      if (prev.includes(agentFormationId)) {
        return prev.filter((id) => id !== agentFormationId)
      } else {
        return [...prev, agentFormationId]
      }
    })
    if (onAgentFormationSelect) {
      onAgentFormationSelect(agentFormationId)
    }
  }

  const handleSelectAll = () => {
    if (selectedAgentFormations.length === paginatedAgentFormations.length) {
      setSelectedAgentFormations([])
    } else {
      setSelectedAgentFormations(paginatedAgentFormations.map((af) => af.id))
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setShowSortMenu(false)
    setCurrentPage(1)
  }

  const sortedAndFilteredAgentFormations = useMemo(() => {
    let filtered = [...initialAgentFormations]

    if (!sortField) {
      return filtered
    }

    const sorted = filtered.sort((a, b) => {
      let aVal: string | number | Date
      let bVal: string | number | Date

      switch (sortField) {
        case "agentName":
          aVal = a.agent.nomPrenom
          bVal = b.agent.nomPrenom
          break
        case "formationName":
          aVal = a.formation.formation
          bVal = b.formation.formation
          break
        case "dateDebut":
          aVal = new Date(a.dateDebut).getTime()
          bVal = new Date(b.dateDebut).getTime()
          break
        case "dateFin":
          aVal = new Date(a.dateFin).getTime()
          bVal = new Date(b.dateFin).getTime()
          break
        case "moyenne":
          aVal = a.moyenne
          bVal = b.moyenne
          break
        case "createdAt":
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        case "updatedAt":
          aVal = new Date(a.updatedAt).getTime()
          bVal = new Date(b.updatedAt).getTime()
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [initialAgentFormations, sortField, sortOrder])

  const paginatedAgentFormations = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedAndFilteredAgentFormations.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [sortedAndFilteredAgentFormations, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredAgentFormations.length / ITEMS_PER_PAGE)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatSimpleDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = [
      "Agent",
      "Formation",
      "Date Début",
      "Date Fin",
      "Référence",
      "Résultat",
      "Moyenne",
      "Date de création",
      "Date de modification",
    ]
    const rows = sortedAndFilteredAgentFormations.map((af: AgentFormationWithRelations) => [
      `${af.agent.grade} ${af.agent.nomPrenom}`,
      af.formation.formation,
      af.dateDebut,
      af.dateFin,
      af.reference || "",
      af.resultat || "",
      af.moyenne,
      formatDate(af.createdAt),
      formatDate(af.updatedAt),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `formations-agent-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(sortedAndFilteredAgentFormations, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `formations-agent-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const handleDeleteClick = (agentFormation: AgentFormationWithRelations) => {
    if (!selectedAgentFormations.includes(agentFormation.id)) {
      return
    }
    setAgentFormationToDelete(agentFormation)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!agentFormationToDelete) return

    try {
      if (onDeleteAgentFormation) {
        const result = await onDeleteAgentFormation(agentFormationToDelete.id)

        if (result.success) {
          setSelectedAgentFormations((prev) => prev.filter((id) => id !== agentFormationToDelete.id))
          setDeleteDialogOpen(false)
          setAgentFormationToDelete(null)
        } else {
          console.error("Erreur lors de la suppression:", result.error)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setAgentFormationToDelete(null)
  }

  const handleEditClick = (agentFormation: AgentFormationWithRelations) => {
    if (!selectedAgentFormations.includes(agentFormation.id)) {
      return
    }
    setAgentFormationToEdit(agentFormation)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async (data: Partial<AgentFormationWithRelations>) => {
    if (!agentFormationToEdit) return

    try {
      if (onSaveEdit) {
        const result = await onSaveEdit({
          ...agentFormationToEdit,
          ...data,
        } as AgentFormationWithRelations)

        if (result.success) {
          setEditDialogOpen(false)
          setAgentFormationToEdit(null)
        } else {
          console.error("Erreur lors de la modification:", result.error)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditDialogOpen(false)
    setAgentFormationToEdit(null)
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
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2"></div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Trier{" "}
              {sortField && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">1</span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => {
                      setSortField(null)
                      setShowSortMenu(false)
                      setCurrentPage(1)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      !sortField ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Annuler le tri</span>
                    {!sortField && <Check size={14} className="text-primary" />}
                  </button>
                  <div className="h-px bg-border/30 my-1" />
                  <button
                    onClick={() => handleSort("agentName")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "agentName" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Agent {sortField === "agentName" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}</span>
                    {sortField === "agentName" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("formationName")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "formationName" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Formation {sortField === "formationName" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}</span>
                    {sortField === "formationName" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("dateDebut")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "dateDebut" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Date début {sortField === "dateDebut" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "dateDebut" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("dateFin")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "dateFin" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Date fin {sortField === "dateFin" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "dateFin" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("moyenne")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "moyenne" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Moyenne {sortField === "moyenne" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "moyenne" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("createdAt")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "createdAt" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Date création {sortField === "createdAt" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "createdAt" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("updatedAt")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "updatedAt" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Date modification {sortField === "updatedAt" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "updatedAt" && <Check size={14} className="text-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
            >
              <Download size={14} />
              Exporter
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-background border border-border/50 shadow-lg rounded-md z-20">
                  <button
                    onClick={() => {
                      exportToCSV()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 border-t border-border/30"
                  >
                    JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-background border border-border overflow-hidden rounded-lg relative">
        <div className="overflow-x-auto">
          <div>
            <div
              className="px-3 py-3 text-xs font-semibold text-foreground border-b border-border text-left"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 220px 280px 120px 120px 120px 140px 100px 180px 1fr 40px",
                columnGap: "0px",
                backgroundColor: "#F3F3F3",
              }}
            >
              <div className="flex items-center justify-center border-r border-border pr-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border/40 cursor-pointer"
                  style={
                    mounted
                      ? {
                          accentColor: isDark ? "rgb(113, 113, 122)" : "rgb(161, 161, 170)",
                        }
                      : {}
                  }
                  checked={paginatedAgentFormations.length > 0 && selectedAgentFormations.length === paginatedAgentFormations.length}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <User className="w-3.5 h-3.5 opacity-50" />
                <span>Agent</span>
                {sortField === "agentName" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <BookOpen className="w-3.5 h-3.5 opacity-50" />
                <span>Formation</span>
                {sortField === "formationName" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Date Début</span>
                {sortField === "dateDebut" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Date Fin</span>
                {sortField === "dateFin" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Hash className="w-3.5 h-3.5 opacity-50" />
                <span>Référence</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Award className="w-3.5 h-3.5 opacity-50" />
                <span>Résultat</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <TrendingUp className="w-3.5 h-3.5 opacity-50" />
                <span>Moyenne</span>
                {sortField === "moyenne" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Créé le</span>
                {sortField === "createdAt" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Modifié le</span>
                {sortField === "updatedAt" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center justify-center pl-3">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-50">
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="13" cy="8" r="1" fill="currentColor" />
                  <circle cx="3" cy="8" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}-sort-${sortField || "none"}-order-${sortOrder}`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedAgentFormations.map((agentFormation: AgentFormationWithRelations) => (
                  <motion.div key={agentFormation.id} variants={shouldAnimate ? rowVariants : {}}>
                    <div
                      className={`px-3 py-3.5 group relative transition-all duration-150 border-b border-border ${
                        selectedAgentFormations.includes(agentFormation.id) ? "bg-slate-100 dark:bg-slate-800" : "bg-muted/5 hover:bg-muted/20"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 220px 280px 120px 120px 120px 140px 100px 180px 1fr 40px",
                        columnGap: "0px",
                        alignItems: "center",
                      }}
                    >
                      <div className="flex items-center justify-center border-r border-border pr-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border/40 cursor-pointer"
                          style={
                            mounted
                              ? {
                                  accentColor: isDark ? "rgb(113, 113, 122)" : "rgb(161, 161, 170)",
                                }
                              : {}
                          }
                          checked={selectedAgentFormations.includes(agentFormation.id)}
                          onChange={() => handleAgentFormationSelect(agentFormation.id)}
                        />
                      </div>

                      <div className="flex items-center gap-2 min-w-0 border-r border-border px-3">
                        <div
                          className="text-sm text-foreground truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {agentFormation.agent.grade} {agentFormation.agent.nomPrenom}
                        </div>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80 truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {agentFormation.formation.formation}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80">{formatSimpleDate(agentFormation.dateDebut)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80">{formatSimpleDate(agentFormation.dateFin)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80 truncate">{agentFormation.reference || "-"}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80 truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {agentFormation.resultat || "-"}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80 font-medium">{agentFormation.moyenne}/20</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">{formatDate(agentFormation.createdAt)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">{formatDate(agentFormation.updatedAt)}</span>
                      </div>

                      <div className="flex items-center justify-center pl-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex items-center">
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => handleEditClick(agentFormation)}
                              disabled={!selectedAgentFormations.includes(agentFormation.id)}
                            >
                              <Edit size={14} />
                              <span>Édition</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteClick(agentFormation)}
                              disabled={!selectedAgentFormations.includes(agentFormation.id)}
                            >
                              <Trash2 size={14} />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70">
            Page {currentPage} of {totalPages} • {sortedAndFilteredAgentFormations.length} formations agent
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md cursor-pointer"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md cursor-pointer"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
            <AlertDialogDescription className="py-3" dir="ltr">
              Êtes-vous sûr de vouloir supprimer la formation agent sélectionnée ?
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start cursor-pointer">
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
              Supprimer
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleCancelDelete} className="cursor-pointer">
              Annuler
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DialogueEditAgentFormation
        agentFormation={agentFormationToEdit}
        isOpen={editDialogOpen}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
