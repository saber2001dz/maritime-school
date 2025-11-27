"use client"
// Updated: reduced last column width
import { useState, useEffect, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Download,
  ChevronDown,
  Phone,
  User as UserIcon,
  Mail,
  Briefcase,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Hash,
  ClipboardList,
  Layers,
  Check,
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
import { DialogueEditAgent } from "./dialogue-edit-agent"

export interface Agent {
  id: string
  nomPrenom: string
  grade: string
  matricule: string
  responsabilite: string
  telephone: number
  categorie: string
  avatar?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

interface AgentsTableProps {
  agents?: Agent[]
  onAgentSelect?: (agentId: string) => void
  className?: string
  enableAnimations?: boolean
  onSaveEdit?: (agent: Agent) => Promise<{ success: boolean; error?: string }>
  onDeleteAgent?: (agentId: string) => Promise<{ success: boolean; error?: string }>
  isUpdating?: boolean
}

type SortField = "nomPrenom" | "grade" | "matricule" | "categorie" | "createdAt" | "updatedAt"
type SortOrder = "asc" | "desc"

export function AgentsTable({
  agents: initialAgents = [],
  onAgentSelect,
  className = "",
  enableAnimations = true,
  onSaveEdit,
  onDeleteAgent,
  isUpdating = false,
}: AgentsTableProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgents((prev) => {
      if (prev.includes(agentId)) {
        return prev.filter((id) => id !== agentId)
      } else {
        return [...prev, agentId]
      }
    })
    if (onAgentSelect) {
      onAgentSelect(agentId)
    }
  }

  const handleSelectAll = () => {
    if (selectedAgents.length === paginatedAgents.length) {
      setSelectedAgents([])
    } else {
      setSelectedAgents(paginatedAgents.map((a) => a.id))
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

  const sortedAndFilteredAgents = useMemo(() => {
    let filtered = [...initialAgents]

    if (!sortField) {
      return filtered
    }

    const sorted = filtered.sort((a, b) => {
      let aVal: string | number | Date = a[sortField]
      let bVal: string | number | Date = b[sortField]

      // Convertir les dates en timestamps pour la comparaison
      if (aVal instanceof Date) {
        aVal = aVal.getTime()
      } else if (sortField === "createdAt" || sortField === "updatedAt") {
        aVal = new Date(aVal as string).getTime()
      }

      if (bVal instanceof Date) {
        bVal = bVal.getTime()
      } else if (sortField === "createdAt" || sortField === "updatedAt") {
        bVal = new Date(bVal as string).getTime()
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [initialAgents, sortField, sortOrder])

  const paginatedAgents = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedAndFilteredAgents.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [sortedAndFilteredAgents, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredAgents.length / ITEMS_PER_PAGE)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = [
      "Nom et Prénom",
      "Grade",
      "Matricule",
      "Responsabilité",
      "Téléphone",
      "Catégorie",
      "Date de création",
      "Date de modification",
    ]
    const rows = sortedAndFilteredAgents.map((agent: Agent) => [
      agent.nomPrenom,
      agent.grade,
      agent.matricule,
      agent.responsabilite,
      agent.telephone,
      agent.categorie,
      formatDate(agent.createdAt),
      formatDate(agent.updatedAt),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `agents-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(sortedAndFilteredAgents, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `agents-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const handleDeleteClick = (agent: Agent) => {
    if (!selectedAgents.includes(agent.id)) {
      // Si la checkbox n'est pas cochée, ne rien faire
      return
    }
    setAgentToDelete(agent)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return

    try {
      if (onDeleteAgent) {
        const result = await onDeleteAgent(agentToDelete.id)

        if (result.success) {
          // Retirer l'agent de la sélection
          setSelectedAgents((prev) => prev.filter((id) => id !== agentToDelete.id))
          // Fermer le dialogue
          setDeleteDialogOpen(false)
          setAgentToDelete(null)
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
    setAgentToDelete(null)
  }

  const handleEditClick = (agent: Agent) => {
    if (!selectedAgents.includes(agent.id)) {
      // Si la checkbox n'est pas cochée, ne rien faire
      return
    }
    setAgentToEdit(agent)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async (data: Partial<Agent>) => {
    if (!agentToEdit) return

    try {
      if (onSaveEdit) {
        const result = await onSaveEdit({
          ...agentToEdit,
          ...data,
        } as Agent)

        if (result.success) {
          setEditDialogOpen(false)
          setAgentToEdit(null)
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
    setAgentToEdit(null)
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
                    onClick={() => handleSort("nomPrenom")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "nomPrenom" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Nom {sortField === "nomPrenom" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}</span>
                    {sortField === "nomPrenom" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("grade")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "grade" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Grade {sortField === "grade" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "grade" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("categorie")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "categorie" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Catégorie {sortField === "categorie" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "categorie" && <Check size={14} className="text-primary" />}
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
                gridTemplateColumns: "40px 250px 160px 120px 180px 140px 200px 200px 1fr 40px",
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
                  checked={paginatedAgents.length > 0 && selectedAgents.length === paginatedAgents.length}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <UserIcon className="w-3.5 h-3.5 opacity-50" />
                <span>Nom et Prénom</span>
                {sortField === "nomPrenom" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Briefcase className="w-3.5 h-3.5 opacity-50" />
                <span>Grade</span>
                {sortField === "grade" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Hash className="w-3.5 h-3.5 opacity-50" />
                <span>Matricule</span>
                {sortField === "matricule" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <ClipboardList className="w-3.5 h-3.5 opacity-50" />
                <span>Responsabilité</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Phone className="w-3.5 h-3.5 opacity-50" />
                <span>Téléphone</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Layers className="w-3.5 h-3.5 opacity-50" />
                <span>Catégorie</span>
                {sortField === "categorie" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
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
                {paginatedAgents.map((agent: Agent) => (
                  <motion.div key={agent.id} variants={shouldAnimate ? rowVariants : {}}>
                    <div
                      className={`px-3 py-3.5 group relative transition-all duration-150 border-b border-border ${
                        selectedAgents.includes(agent.id) ? "bg-slate-100 dark:bg-slate-800" : "bg-muted/5 hover:bg-muted/20"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 250px 160px 120px 180px 140px 200px 200px 1fr 40px",
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
                          checked={selectedAgents.includes(agent.id)}
                          onChange={() => handleAgentSelect(agent.id)}
                        />
                      </div>

                      <div className="flex items-center gap-2 min-w-0 border-r border-border px-3">
                        <div
                          className="text-sm text-foreground truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {agent.nomPrenom}
                        </div>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80 truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {agent.grade}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80 truncate">{agent.matricule}</span>
                      </div>

                      <div className="flex items-center min-w-0 border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80 truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {agent.responsabilite}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80">{agent.telephone}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {agent.categorie}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">{formatDate(agent.createdAt)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">{formatDate(agent.updatedAt)}</span>
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
                              onClick={() => handleEditClick(agent)}
                              disabled={!selectedAgents.includes(agent.id)}
                            >
                              <Edit size={14} />
                              <span>Édition</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteClick(agent)}
                              disabled={!selectedAgents.includes(agent.id)}
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
            Page {currentPage} of {totalPages} • {sortedAndFilteredAgents.length} agents
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
              Êtes-vous sûr de vouloir supprimer l'agent sélectionné dans la table ?
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

      <DialogueEditAgent
        agent={agentToEdit}
        isOpen={editDialogOpen}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
