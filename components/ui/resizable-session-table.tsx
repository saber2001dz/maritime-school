"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Download,
  ChevronDown,
  Search,
  X,
  ArrowDown,
  Check,
  SquarePen,
  Users,
  CirclePlus,
  MoreVertical,
  Trash2,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export interface SessionFormation {
  id: string
  formationId: string
  dateDebut: Date
  dateFin: Date
  nombreParticipants: number
  reference: string | null
  statut: string
  color?: string | null
  createdAt: Date
  formation: {
    id: string
    formation: string
    typeFormation: string
    specialite: string | null
  }
}

interface ResizableSessionTableProps {
  title?: string
  sessions: SessionFormation[]
  onSessionSelect?: (sessionId: string) => void
  onAddNewSession?: () => void
  onEditSession?: (session: SessionFormation) => void
  className?: string
  enableAnimations?: boolean
}

type SortField = "formation" | "dateDebut" | "dateFin" | "nombreParticipants" | "createdAt"
type SortOrder = "asc" | "desc"

// Fonction pour normaliser les lettres arabes pour la recherche
const normalizeArabicText = (text: string): string => {
  return text
    .replace(/[أإآا]/g, "ا") // Normaliser toutes les variantes de alif en alif simple
    .toLowerCase()
}

// Helper function to get status badge colors
const getStatusColor = (statut: string, isDark: boolean) => {
  switch (statut) {
    case "مبرمجة": // Scheduled
      return {
        bgColor: isDark ? "bg-blue-500/10" : "bg-blue-50",
        textColor: isDark ? "text-blue-400" : "text-blue-600",
        dotColor: isDark ? "bg-blue-400" : "bg-blue-600",
      }
    case "قيد التنفيذ": // In Progress
      return {
        bgColor: isDark ? "bg-green-500/10" : "bg-green-50",
        textColor: isDark ? "text-green-400" : "text-green-600",
        dotColor: isDark ? "bg-green-400" : "bg-green-600",
      }
    case "انتهت": // Completed
      return {
        bgColor: isDark ? "bg-orange-500/10" : "bg-orange-50",
        textColor: isDark ? "text-orange-400" : "text-orange-600",
        dotColor: isDark ? "bg-orange-400" : "bg-orange-600",
      }
    default:
      return {
        bgColor: isDark ? "bg-gray-500/10" : "bg-gray-50",
        textColor: isDark ? "text-gray-400" : "text-gray-600",
        dotColor: isDark ? "bg-gray-400" : "bg-gray-600",
      }
  }
}

export function ResizableSessionTable({
  title = "Session",
  sessions: initialSessions,
  onSessionSelect,
  onAddNewSession,
  onEditSession,
  className = "",
  enableAnimations = true,
}: ResizableSessionTableProps) {
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [filterFormationType, setFilterFormationType] = useState<string | null>(null)
  const [filterStatut, setFilterStatut] = useState<string | null>(null)
  const [filterYear, setFilterYear] = useState<number | null>(null)
  const [showYearMenu, setShowYearMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchReference, setSearchReference] = useState<string>("")
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<SessionFormation | null>(null)

  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const { addToast } = useToast()

  // Column width state with default values
  const [columnWidths] = useState<Record<string, number>>({
    number: 60,
    formation: 360,
    dateDebut: 190,
    dateFin: 190,
    nombreParticipants: 150,
    reference: 260,
    statut: 160,
    actions: 50,
  })

  const itemsPerPage = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filtrage et recherche
  const filteredSessions = useMemo(() => {
    let result = [...initialSessions]

    // Filtrage par type de formation
    if (filterFormationType) {
      result = result.filter((session) => session.formation.typeFormation === filterFormationType)
    }

    // Filtrage par statut
    if (filterStatut) {
      result = result.filter((session) => session.statut === filterStatut)
    }

    // Filtrage par année (basé sur dateDebut)
    if (filterYear) {
      result = result.filter((session) => {
        const year = new Date(session.dateDebut).getFullYear()
        return year === filterYear
      })
    }

    // Recherche par nom de formation
    if (searchQuery) {
      const normalizedQuery = normalizeArabicText(searchQuery)
      result = result.filter((session) => {
        const normalizedFormation = normalizeArabicText(session.formation.formation)
        return normalizedFormation.includes(normalizedQuery)
      })
    }

    // Recherche par référence
    if (searchReference) {
      result = result.filter((session) => session.reference?.toLowerCase().includes(searchReference.toLowerCase()))
    }

    return result
  }, [initialSessions, filterFormationType, filterStatut, filterYear, searchQuery, searchReference])

  // Helper function to get status priority for sorting
  // Priority: "قيد التنفيذ" (In Progress) = 1, "مبرمجة" (Scheduled) = 2, "انتهت" (Completed) = 3
  const getStatusPriority = (statut: string): number => {
    switch (statut) {
      case "قيد التنفيذ":
        return 1
      case "مبرمجة":
        return 2
      case "انتهت":
        return 3
      default:
        return 4
    }
  }

  // Tri
  const sortedSessions = useMemo(() => {
    // Default sort: by status priority, then by dateDebut with different logic per status
    if (!sortField || sortField === "createdAt") {
      return [...filteredSessions].sort((a, b) => {
        // First, sort by status priority
        const statusPriorityA = getStatusPriority(a.statut)
        const statusPriorityB = getStatusPriority(b.statut)

        if (statusPriorityA !== statusPriorityB) {
          return statusPriorityA - statusPriorityB
        }

        // Parse dates ensuring consistent handling of both Date objects and ISO strings
        const dateA = a.dateDebut instanceof Date ? a.dateDebut.getTime() : new Date(a.dateDebut).getTime()
        const dateB = b.dateDebut instanceof Date ? b.dateDebut.getTime() : new Date(b.dateDebut).getTime()

        // Within each status group, apply different sorting logic:
        // - "قيد التنفيذ" (In Progress): ascending order (started earliest first)
        // - "مبرمجة" (Scheduled/future): ascending order (closest date first)
        // - "انتهت" (Completed): descending order (most recent first)
        if (a.statut === "قيد التنفيذ" || a.statut === "مبرمجة") {
          return dateA - dateB // Ascending
        }
        return dateB - dateA // Descending: most recent date first
      })
    }

    return [...filteredSessions].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortField) {
        case "formation":
          aValue = a.formation.formation
          bValue = b.formation.formation
          break
        case "dateDebut":
          aValue = a.dateDebut instanceof Date ? a.dateDebut.getTime() : new Date(a.dateDebut).getTime()
          bValue = b.dateDebut instanceof Date ? b.dateDebut.getTime() : new Date(b.dateDebut).getTime()
          break
        case "dateFin":
          aValue = a.dateFin instanceof Date ? a.dateFin.getTime() : new Date(a.dateFin).getTime()
          bValue = b.dateFin instanceof Date ? b.dateFin.getTime() : new Date(b.dateFin).getTime()
          break
        case "nombreParticipants":
          aValue = a.nombreParticipants
          bValue = b.nombreParticipants
          break
        default:
          return 0
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }, [filteredSessions, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage)
  const paginatedSessions = sortedSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Gestion du tri
  const handleSort = (field: SortField | null) => {
    if (field === null) {
      // Revenir au tri par défaut (date de création, plus récent en premier)
      setSortField("createdAt")
      setSortOrder("desc")
    } else if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      // Pour les dates, trier du plus récent au moins récent par défaut
      setSortOrder(field === "dateDebut" || field === "dateFin" || field === "createdAt" ? "desc" : "asc")
    }
    setShowSortMenu(false)
  }

  // Gestion du filtrage
  const handleFilter = (formationType: string | null) => {
    setFilterFormationType(formationType)
    setCurrentPage(1)
    setShowFilterMenu(false)
  }

  // Export CSV
  const exportToCSV = () => {
    const headers = ["التكوين", "تاريخ البداية", "تاريخ النهاية", "عدد المشاركين", "المرجع", "الوضعية"]
    const rows = sortedSessions.map((session) => [
      session.formation.formation,
      new Date(session.dateDebut).toLocaleDateString("fr-FR"),
      new Date(session.dateFin).toLocaleDateString("fr-FR"),
      session.nombreParticipants.toString(),
      session.reference || "-",
      session.statut || "-",
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sessions_formation_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    addToast({
      title: "تـــم التــصــديــر",
      description: "تم تصدير البيانات بنجاح إلى ملف CSV",
      variant: "success",
    })
  }

  // Export JSON
  const exportToJSON = () => {
    const data = sortedSessions.map((session) => ({
      formation: session.formation.formation,
      typeFormation: session.formation.typeFormation,
      dateDebut: new Date(session.dateDebut).toLocaleDateString("fr-FR"),
      dateFin: new Date(session.dateFin).toLocaleDateString("fr-FR"),
      nombreParticipants: session.nombreParticipants,
      reference: session.reference || "-",
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sessions_formation_${new Date().toISOString().split("T")[0]}.json`
    link.click()

    addToast({
      title: "تـــم التــصــديــر",
      description: "تم تصدير البيانات بنجاح إلى ملف JSON",
      variant: "success",
    })
  }

  // Gestion de la sélection
  const handleCheckboxChange = (sessionId: string) => {
    // Sélectionner une seule ligne à la fois, ou décocher si déjà sélectionné
    setSelectedSessions((prev) => {
      if (prev.includes(sessionId)) {
        return [] // Décocher
      } else {
        return [sessionId] // Sélectionner uniquement cette ligne
      }
    })
  }

  // Gestion de la suppression
  const handleDeleteClick = (session: SessionFormation) => {
    setSessionToDelete(session)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!sessionToDelete) return

    try {
      const response = await fetch(`/api/session-formations/${sessionToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      addToast({
        title: "تـــم الـحــــذف",
        description: "تم حذف الدورة التكوينية بنجاح",
        variant: "success",
      })

      setDeleteDialogOpen(false)
      setSessionToDelete(null)
      setSelectedSessions([])

      // Si c'est la dernière ligne de la page actuelle et qu'on n'est pas sur la page 1,
      // revenir à la page précédente
      if (paginatedSessions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }

      window.location.reload()
    } catch (error) {
      addToast({
        title: "خـطـــأ",
        description: "حدث خطأ أثناء حذف الدورة التكوينية",
        variant: "error",
      })
    }
  }

  // Gestion de l'édition
  const handleEditClick = (session: SessionFormation) => {
    onEditSession?.(session)
  }

  const formatDateYYYYMMDD = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
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
  } as const

  return (
    <div className={`w-full mt-4 max-w-7xl mx-auto ${className}`}>
      {/* Barre de recherche et filtres */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Ligne 1: Inputs de recherche à droite */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full max-w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="بــحــث عــن تــكــويــن . . ."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pr-9 pl-9 focus-visible:ring-1"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative w-full max-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="بــحــث بــالــمــرجـــع . . ."
              value={searchReference}
              onChange={(e) => {
                setSearchReference(e.target.value)
                setCurrentPage(1)
              }}
              className="pr-9 pl-9 focus-visible:ring-1"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            />
            {searchReference && (
              <button
                onClick={() => {
                  setSearchReference("")
                  setCurrentPage(1)
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search reference"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ligne 2: Boutons à gauche */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bouton de tri */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer ${
                sortField && sortField !== "createdAt" ? "ring-2 ring-primary/30" : ""
              }`}
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 4.5H13M5 8H11M7 11.5H9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ترتــيــب{" "}
              {sortField && sortField !== "createdAt" && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 pt-1">1</span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => handleSort(null)}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors border-b border-border/30 flex items-center justify-between ${
                      sortField === "createdAt" && sortOrder === "desc" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>إلغــاء التـرتيـب</span>
                    {sortField === "createdAt" && sortOrder === "desc" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("formation")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "formation" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>التـكــويــــــــــن</span>
                    {sortField === "formation" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("dateDebut")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "dateDebut" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>تــاريخ البدايــة</span>
                    {sortField === "dateDebut" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("nombreParticipants")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "nombreParticipants" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>عـدد المشاركين</span>
                    {sortField === "nombreParticipants" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bouton de filtrage */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer ${
                filterFormationType || filterStatut ? "ring-2 ring-primary/30" : ""
              }`}
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3H14M4 8H12M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              تـصـفـيـة
              {(filterFormationType || filterStatut) && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 pt-1">
                  {(filterFormationType ? 1 : 0) + (filterStatut ? 1 : 0)}
                </span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-1 w-56 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  {/* Formation Type Filter */}
                  <div
                    className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/50"
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    نـوع التـكـويـن
                  </div>
                  <button
                    onClick={() => handleFilter(null)}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      !filterFormationType ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>كل الأنواع</span>
                    {!filterFormationType && <Check className="h-4 w-4 text-primary" />}
                  </button>

                  {["تكوين إختصاص", "تكوين تخصصي", "تكوين مستمر"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilter(type)}
                      className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        filterFormationType === type ? "bg-muted/30" : ""
                      }`}
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      <span>{type}</span>
                      {filterFormationType === type && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}

                  {/* Status Filter */}
                  <div
                    className="px-3 py-2 text-xs font-semibold text-muted-foreground border-t border-b border-border/50 mt-1"
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    الوضعية
                  </div>
                  <button
                    onClick={() => {
                      setFilterStatut(null)
                      setCurrentPage(1)
                      setShowFilterMenu(false)
                    }}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      !filterStatut ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>كل الحالات</span>
                    {!filterStatut && <Check className="h-4 w-4 text-primary" />}
                  </button>

                  {["مبرمجة", "قيد التنفيذ", "انتهت"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatut(status)
                        setCurrentPage(1)
                        setShowFilterMenu(false)
                      }}
                      className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        filterStatut === status ? "bg-muted/30" : ""
                      }`}
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      <span>{status}</span>
                      {filterStatut === status && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bouton de filtrage par année */}
          <div className="relative">
            <button
              onClick={() => setShowYearMenu(!showYearMenu)}
              className={`px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer ${
                filterYear ? "ring-2 ring-primary/30" : ""
              }`}
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <CalendarDays size={14} />
              السنوات
              {filterYear && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 pt-1">
                  {filterYear}
                </span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showYearMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowYearMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFilterYear(null)
                      setCurrentPage(1)
                      setShowYearMenu(false)
                    }}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      !filterYear ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>كل السنوات</span>
                    {!filterYear && <Check className="h-4 w-4 text-primary" />}
                  </button>

                  {Array.from({ length: 2032 - 2010 + 1 }, (_, i) => 2032 - i).map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setFilterYear(year)
                        setCurrentPage(1)
                        setShowYearMenu(false)
                      }}
                      className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        filterYear === year ? "bg-muted/30" : ""
                      }`}
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      <span>{year}</span>
                      {filterYear === year && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bouton d'export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <Download size={14} />
              تــصــديــر
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

          {/* Bouton ajouter nouvelle session */}
          {onAddNewSession && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onAddNewSession}
                  className={`ml-1 p-2 border border-border text-sm transition-colors flex items-center justify-center rounded-md cursor-pointer ${
                    mounted
                      ? isDark
                        ? "bg-blue-950/40 text-foreground/90 hover:bg-blue-950/60"
                        : "bg-slate-100 text-[#06407F] hover:bg-slate-200"
                      : "bg-muted/5 text-foreground hover:bg-muted/10"
                  }`}
                  aria-label="إضافة دورة جديدة"
                >
                  <CirclePlus size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>إضافة دورة جديدة</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={`bg-background overflow-hidden rounded-lg relative ${
          mounted ? (isDark ? "border border-zinc-600" : "border border-zinc-300") : "border-2 border-border"
        }`}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* En-tête du tableau */}
            <div
              className={`flex py-3 text-xs font-semibold text-[#06407F] dark:text-foreground/90 ${
                mounted
                  ? isDark
                    ? "bg-blue-950/40 border-b border-zinc-600"
                    : "bg-slate-100 border-b border-zinc-300"
                  : "bg-muted/5 border-b-2 border-border"
              }`}
            >
              <div
                className={`flex items-center justify-center ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.number }}
              >
                <span className="text-xs font-semibold">#</span>
              </div>

              <div
                className={`flex items-center px-3 relative gap-1.5 ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.formation }}
              >
                <span>التــكـــــويــــــــــــن</span>
                {sortField === "formation" && <ArrowDown className="h-3.5 w-3.5 text-muted-foreground mr-2" />}
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.dateDebut }}
              >
                <span>تــاريــخ البــــدايــــة</span>
                {sortField === "dateDebut" && <ArrowDown className="h-3.5 w-3.5 text-muted-foreground mr-2" />}
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.dateFin }}
              >
                <span>تــاريــخ النهــايــــة</span>
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.nombreParticipants }}
              >
                <span>عـــدد المشاركــين</span>
                {sortField === "nombreParticipants" && <ArrowDown className="h-3.5 w-3.5 text-muted-foreground mr-2" />}
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.reference }}
              >
                <span>المــــــرجـــــــــع</span>
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.statut }}
              >
                <span>الـــوضعيـــــة</span>
              </div>

              <div className="flex mx-2 items-center justify-center relative" style={{ width: columnWidths.actions }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-50">
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="13" cy="8" r="1" fill="currentColor" />
                  <circle cx="3" cy="8" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Corps du tableau */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}-filter-${filterFormationType || "all"}-statut-${filterStatut || "all"}-year-${
                  filterYear || "all"
                }-sort-${sortField || "none"}-search-${searchQuery}-reference-${searchReference}-count-${
                  initialSessions.length
                }`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedSessions.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>لا توجد دورات تكوينية</p>
                  </div>
                ) : (
                  <>
                    {paginatedSessions.map((session) => (
                      <motion.div key={session.id} variants={shouldAnimate ? rowVariants : {}}>
                        <div
                          className={`flex items-center text-sm ${
                            selectedSessions.includes(session.id)
                              ? isDark
                                ? "bg-zinc-700/60"
                                : "bg-gray-300/40"
                              : "bg-muted/5 hover:bg-muted/20"
                          } ${
                            mounted
                              ? isDark
                                ? "border-b border-zinc-700"
                                : "border-b border-zinc-200"
                              : "border-b-2 border-border"
                          } transition-colors`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`flex items-center justify-center py-2 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-700"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.number }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSessions.includes(session.id)}
                              onChange={() => handleCheckboxChange(session.id)}
                              className="w-4 h-4 rounded border-border/40 cursor-pointer"
                              style={
                                mounted
                                  ? {
                                      accentColor: isDark ? "rgb(113, 113, 122)" : "rgb(161, 161, 170)",
                                    }
                                  : {}
                              }
                            />
                          </div>

                          {/* Formation */}
                          <div
                            className={`px-3 py-2 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-700"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.formation, fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                          >
                            <div className="font-medium">{session.formation.formation}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {session.formation.typeFormation}
                            </div>
                          </div>

                          {/* Date début */}
                          <div
                            className={`px-3 py-2 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-700"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.dateDebut }}
                          >
                            <div className="flex items-center gap-1.5">
                              <CalendarDays size={14} className="text-muted-foreground" />
                              {formatDateYYYYMMDD(session.dateDebut)}
                            </div>
                          </div>

                          {/* Date fin */}
                          <div
                            className={`px-3 py-2 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-700"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.dateFin }}
                          >
                            <div className="flex items-center gap-1.5">
                              <CalendarDays size={14} className="text-muted-foreground" />
                              {formatDateYYYYMMDD(session.dateFin)}
                            </div>
                          </div>

                          {/* Nombre participants */}
                          <div
                            className={`px-3 py-2 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-700"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.nombreParticipants }}
                          >
                            <div className="flex items-center gap-1.5">
                              <Users size={14} className="text-muted-foreground" />
                              {session.nombreParticipants}
                            </div>
                          </div>

                          {/* Référence */}
                          <div
                            className={`px-3 py-2 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-700"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.reference, fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                          >
                            {session.reference || "-"}
                          </div>

                          {/* Statut */}
                          <div
                            className={`px-3 py-2 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-700"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.statut }}
                          >
                            {(() => {
                              const { bgColor, textColor, dotColor } = getStatusColor(session.statut, isDark)
                              return (
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap ${bgColor} ${textColor} rounded-md`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                                  <span style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>{session.statut}</span>
                                </div>
                              )
                            })()}
                          </div>

                          {/* Actions */}
                          <div
                            className="flex mx-2 items-center justify-center"
                            style={{ width: columnWidths.actions }}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex items-center">
                                  <MoreVertical size={16} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" side="bottom">
                                <DropdownMenuItem
                                  dir="rtl"
                                  className="gap-2 cursor-pointer"
                                  onClick={() => handleEditClick(session)}
                                  disabled={!selectedSessions.includes(session.id)}
                                >
                                  <SquarePen size={14} />
                                  <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                    تعـديـل بيــانـــات
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  dir="rtl"
                                  className="gap-2 cursor-pointer"
                                  onClick={() => {
                                    // TODO: Implement participant list view
                                  }}
                                  disabled={!selectedSessions.includes(session.id)}
                                >
                                  <Users size={14} />
                                  <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                    قائمـة المشاركيــن
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  dir="rtl"
                                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                  onClick={() => handleDeleteClick(session)}
                                  disabled={!selectedSessions.includes(session.id)}
                                >
                                  <Trash2 size={14} />
                                  <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                    حـــــــــــــــــــــذف
                                  </span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {sortedSessions.length > 0 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
            الصفحــة {currentPage} مــن {totalPages} - ({sortedSessions.length}{" "}
            {sortedSessions.length < 11 ? "دورات" : "دورة"})
          </div>

          <div className="flex gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
                >
                  <ChevronsRight size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>الصفحة الأولى</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
                  style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                >
                  السابق
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>الصفحة السابقة</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
                  style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                >
                  التالي
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>الصفحة التالية</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
                >
                  <ChevronsLeft size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>الصفحة الأخيرة</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-start font-bold text-xl"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              تأكيــد الحـــــذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
              هل أنت متأكد من حذف هذه الدورة التكوينية؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
              إلغـــاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              حـــــذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function ResizableSessionTableWithToast(props: ResizableSessionTableProps) {
  return (
    <ToastProvider>
      <ResizableSessionTable {...props} />
    </ToastProvider>
  )
}
