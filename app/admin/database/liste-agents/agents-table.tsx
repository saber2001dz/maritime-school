"use client"
// Updated: reduced last column width
import { useState, useEffect, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Download,
  ChevronDown,
  X,
  Phone,
  User as UserIcon,
  Mail,
  Briefcase,
  Calendar,
  MoreVertical,
} from "lucide-react"

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
}

type SortField = "nomPrenom" | "grade" | "matricule" | "categorie" | "createdAt" | "updatedAt"
type SortOrder = "asc" | "desc"

export function AgentsTable({
  agents: initialAgents = [],
  onAgentSelect,
  className = "",
  enableAnimations = true,
}: AgentsTableProps) {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [filterCategorie, setFilterCategorie] = useState<string | null>(null)
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<Agent | null>(null)
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

  const handleFilter = (categorie: string | null) => {
    setFilterCategorie(categorie)
    setShowFilterMenu(false)
    setCurrentPage(1)
  }

  const sortedAndFilteredAgents = useMemo(() => {
    let filtered = [...initialAgents]

    if (filterCategorie) {
      filtered = filtered.filter((a) => a.categorie === filterCategorie)
    }

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
  }, [initialAgents, sortField, sortOrder, filterCategorie])

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
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md ${
                filterCategorie ? "ring-2 ring-primary/30" : ""
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3H14M4 8H12M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Filtrer
              {filterCategorie && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">1</span>
              )}
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => handleFilter(null)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                      !filterCategorie ? "bg-muted/30" : ""
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  <div className="h-px bg-border/30 my-1" />
                  {["A", "B", "C", "D"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilter(cat)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                        filterCategorie === cat ? "bg-muted/30" : ""
                      }`}
                    >
                      Catégorie {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

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
                    onClick={() => handleSort("nomPrenom")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "nomPrenom" ? "bg-muted/30" : ""
                    }`}
                  >
                    Nom {sortField === "nomPrenom" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}
                  </button>
                  <button
                    onClick={() => handleSort("grade")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "grade" ? "bg-muted/30" : ""
                    }`}
                  >
                    Grade {sortField === "grade" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("categorie")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "categorie" ? "bg-muted/30" : ""
                    }`}
                  >
                    Catégorie {sortField === "categorie" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("createdAt")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "createdAt" ? "bg-muted/30" : ""
                    }`}
                  >
                    Date création {sortField === "createdAt" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("updatedAt")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "updatedAt" ? "bg-muted/30" : ""
                    }`}
                  >
                    Date modification {sortField === "updatedAt" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
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
              className="px-3 py-3 text-xs font-semibold text-foreground bg-muted/10 border-b border-border text-left"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 250px 160px 120px 180px 140px 200px 200px 1fr 0fr 22px",
                columnGap: "0px",
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
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Briefcase className="w-3.5 h-3.5 opacity-50" />
                <span>Grade</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <span>Matricule</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <span>Responsabilité</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Phone className="w-3.5 h-3.5 opacity-50" />
                <span>Téléphone</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <span>Catégorie</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Créé le</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Modifié le</span>
              </div>
              <div className="flex items-center justify-center px-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-50">
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="13" cy="8" r="1" fill="currentColor" />
                  <circle cx="3" cy="8" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedAgents.map((agent: Agent) => (
                  <motion.div key={agent.id} variants={shouldAnimate ? rowVariants : {}}>
                    <div
                      className={`px-3 py-3.5 group relative transition-all duration-150 border-b border-border ${
                        selectedAgents.includes(agent.id) ? "bg-muted/30" : "bg-muted/5 hover:bg-muted/20"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 250px 160px 120px 180px 140px  200px 200px 1fr 0fr 22px",
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

                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setSelectedAgentDetail(agent)}
                          className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex items-center"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {selectedAgentDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10"
              onClick={() => setSelectedAgentDetail(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
                className="bg-card border border-border rounded-xl p-6 mx-6 shadow-lg relative max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedAgentDetail(null)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted/50 hover:bg-muted/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground cursor-pointer" />
                </button>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-semibold text-foreground"
                        style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                      >
                        {selectedAgentDetail.nomPrenom}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground mt-1"
                        style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                      >
                        Catégorie {selectedAgentDetail.categorie}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Grade</span>
                      </div>
                      <p
                        className="text-sm font-medium text-foreground"
                        style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                      >
                        {selectedAgentDetail.grade}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Matricule</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{selectedAgentDetail.matricule}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Responsabilité</span>
                      </div>
                      <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
                        {selectedAgentDetail.responsabilite}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Téléphone</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{selectedAgentDetail.telephone}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Date de création</span>
                      </div>
                      <p className="text-xs text-foreground">{formatDate(selectedAgentDetail.createdAt)}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">
                          Dernière modification
                        </span>
                      </div>
                      <p className="text-xs text-foreground">{formatDate(selectedAgentDetail.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
    </div>
  )
}
