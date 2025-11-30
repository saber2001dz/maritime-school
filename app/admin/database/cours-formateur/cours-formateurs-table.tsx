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
  User,
  BookOpen,
  Hash,
  Clock,
  Building2,
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
import { DialogueEditCoursFormateur } from "./dialogue-edit-cours-formateur"

export interface CoursFormateurWithRelations {
  id: string
  formateurId: string
  coursId: string
  dateDebut: string
  dateFin: string
  nombreHeures: number
  reference?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  formateur: {
    id: string
    nomPrenom: string
    grade: string
    unite: string
  }
  cours: {
    id: string
    titre: string
  }
}

interface CoursFormateursTableProps {
  coursFormateurs?: CoursFormateurWithRelations[]
  onCoursFormateurSelect?: (coursFormateurId: string) => void
  className?: string
  enableAnimations?: boolean
  onSaveEdit?: (coursFormateur: CoursFormateurWithRelations) => Promise<{ success: boolean; error?: string }>
  onDeleteCoursFormateur?: (coursFormateurId: string) => Promise<{ success: boolean; error?: string }>
  isUpdating?: boolean
}

type SortField = "formateurName" | "coursName" | "dateDebut" | "dateFin" | "nombreHeures" | "createdAt" | "updatedAt"
type SortOrder = "asc" | "desc"

export function CoursFormateursTable({
  coursFormateurs: initialCoursFormateurs = [],
  onCoursFormateurSelect,
  className = "",
  enableAnimations = true,
  onSaveEdit,
  onDeleteCoursFormateur,
  isUpdating = false,
}: CoursFormateursTableProps) {
  const [selectedCoursFormateurs, setSelectedCoursFormateurs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [coursFormateurToDelete, setCoursFormateurToDelete] = useState<CoursFormateurWithRelations | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [coursFormateurToEdit, setCoursFormateurToEdit] = useState<CoursFormateurWithRelations | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  const shouldAnimate = enableAnimations && !shouldReduceMotion

  // Format date helper
  const formatSimpleDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Format datetime helper
  const formatDate = (date: Date | string) => {
    if (!date) return "-"
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Sorting logic
  const sortedCoursFormateurs = useMemo(() => {
    if (!sortField) return initialCoursFormateurs

    return [...initialCoursFormateurs].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "formateurName":
          aValue = `${a.formateur.grade} ${a.formateur.nomPrenom}`.toLowerCase()
          bValue = `${b.formateur.grade} ${b.formateur.nomPrenom}`.toLowerCase()
          break
        case "coursName":
          aValue = a.cours.titre.toLowerCase()
          bValue = b.cours.titre.toLowerCase()
          break
        case "dateDebut":
          aValue = new Date(a.dateDebut).getTime()
          bValue = new Date(b.dateDebut).getTime()
          break
        case "dateFin":
          aValue = new Date(a.dateFin).getTime()
          bValue = new Date(b.dateFin).getTime()
          break
        case "nombreHeures":
          aValue = a.nombreHeures
          bValue = b.nombreHeures
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [initialCoursFormateurs, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedCoursFormateurs.length / ITEMS_PER_PAGE)
  const paginatedCoursFormateurs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedCoursFormateurs.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedCoursFormateurs, currentPage])

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedCoursFormateurs.length === paginatedCoursFormateurs.length) {
      setSelectedCoursFormateurs([])
    } else {
      setSelectedCoursFormateurs(paginatedCoursFormateurs.map((cf) => cf.id))
    }
  }

  const handleSelectCoursFormateur = (id: string) => {
    setSelectedCoursFormateurs((prev) =>
      prev.includes(id) ? prev.filter((cfId) => cfId !== id) : [...prev, id]
    )
    if (onCoursFormateurSelect) {
      onCoursFormateurSelect(id)
    }
  }

  // Sort handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc")
      } else {
        setSortField(null)
        setSortOrder("asc")
      }
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setShowSortMenu(false)
  }

  // Export handlers
  const exportToCSV = () => {
    const headers = ["Formateur", "Cours", "Unité", "Date Début", "Date Fin", "Référence", "Heures", "Créé le", "Modifié le"]
    const csvData = sortedCoursFormateurs.map((cf) => [
      `${cf.formateur.grade} ${cf.formateur.nomPrenom}`,
      cf.cours.titre,
      cf.formateur.unite,
      formatSimpleDate(cf.dateDebut),
      formatSimpleDate(cf.dateFin),
      cf.reference || "-",
      cf.nombreHeures.toString(),
      formatDate(cf.createdAt),
      formatDate(cf.updatedAt),
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cours-formateurs-${new Date().toISOString()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportMenu(false)
  }

  const exportToJSON = () => {
    const jsonData = sortedCoursFormateurs.map((cf) => ({
      id: cf.id,
      formateur: {
        grade: cf.formateur.grade,
        nomPrenom: cf.formateur.nomPrenom,
        unite: cf.formateur.unite,
      },
      cours: cf.cours.titre,
      dateDebut: cf.dateDebut,
      dateFin: cf.dateFin,
      reference: cf.reference,
      nombreHeures: cf.nombreHeures,
      createdAt: cf.createdAt,
      updatedAt: cf.updatedAt,
    }))

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cours-formateurs-${new Date().toISOString()}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportMenu(false)
  }

  // Edit/Delete handlers
  const handleEditCoursFormateur = (coursFormateur: CoursFormateurWithRelations) => {
    setCoursFormateurToEdit(coursFormateur)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (coursFormateur: CoursFormateurWithRelations) => {
    setCoursFormateurToDelete(coursFormateur)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (coursFormateurToDelete && onDeleteCoursFormateur) {
      await onDeleteCoursFormateur(coursFormateurToDelete.id)
      setDeleteDialogOpen(false)
      setCoursFormateurToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setCoursFormateurToDelete(null)
  }

  const handleCancelEdit = () => {
    setEditDialogOpen(false)
    setCoursFormateurToEdit(null)
  }

  const handleSaveEdit = async (coursFormateur: CoursFormateurWithRelations) => {
    if (onSaveEdit) {
      return await onSaveEdit(coursFormateur)
    }
    return { success: false, error: "Fonction de sauvegarde non disponible" }
  }

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldAnimate ? 0.02 : 0,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldAnimate ? 0.3 : 0,
      },
    },
  }

  if (!mounted) {
    return <div className="w-full h-64 flex items-center justify-center">Chargement...</div>
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {sortedCoursFormateurs.length} cours formateur{sortedCoursFormateurs.length > 1 ? "s" : ""}
          </span>
          {selectedCoursFormateurs.length > 0 && (
            <span className="text-sm text-primary">
              ({selectedCoursFormateurs.length} sélectionné{selectedCoursFormateurs.length > 1 ? "s" : ""})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Menu */}
          <DropdownMenu open={showSortMenu} onOpenChange={setShowSortMenu}>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-muted">
              Trier
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleSort("formateurName")}>
                Formateur {sortField === "formateurName" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("coursName")}>
                Cours {sortField === "coursName" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("dateDebut")}>
                Date Début {sortField === "dateDebut" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("dateFin")}>
                Date Fin {sortField === "dateFin" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("nombreHeures")}>
                Heures {sortField === "nombreHeures" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                Créé le {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("updatedAt")}>
                Modifié le {sortField === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              {sortField && (
                <>
                  <div className="border-t my-1" />
                  <DropdownMenuItem
                    onClick={() => {
                      setSortField(null)
                      setSortOrder("asc")
                      setShowSortMenu(false)
                    }}
                  >
                    Annuler le tri
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Menu */}
          <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-muted">
              <Download className="h-4 w-4" />
              Exporter
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>Exporter en CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>Exporter en JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1600px]">
            {/* Header */}
            <div
              className="px-3 py-3 text-xs font-semibold"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 220px 260px 140px 120px 120px 140px 120px 180px 1fr 40px",
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
                  checked={paginatedCoursFormateurs.length > 0 && selectedCoursFormateurs.length === paginatedCoursFormateurs.length}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <User className="w-3.5 h-3.5 opacity-50" />
                <span>Formateur</span>
                {sortField === "formateurName" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <BookOpen className="w-3.5 h-3.5 opacity-50" />
                <span>Cours</span>
                {sortField === "coursName" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Building2 className="w-3.5 h-3.5 opacity-50" />
                <span>Unité</span>
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
                <Clock className="w-3.5 h-3.5 opacity-50" />
                <span>Heures</span>
                {sortField === "nombreHeures" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
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

            {/* Rows */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}-sort-${sortField || "none"}-order-${sortOrder}`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedCoursFormateurs.map((coursFormateur: CoursFormateurWithRelations) => (
                  <motion.div key={coursFormateur.id} variants={shouldAnimate ? rowVariants : {}}>
                    <div
                      className={`px-3 py-3.5 group relative transition-all duration-150 border-b border-border ${
                        selectedCoursFormateurs.includes(coursFormateur.id) ? "bg-slate-100 dark:bg-slate-800" : "bg-muted/5 hover:bg-muted/20"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 220px 260px 140px 120px 120px 140px 120px 180px 1fr 40px",
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
                          checked={selectedCoursFormateurs.includes(coursFormateur.id)}
                          onChange={() => handleSelectCoursFormateur(coursFormateur.id)}
                        />
                      </div>

                      <div className="flex items-center gap-2 min-w-0 border-r border-border px-3">
                        <div
                          className="text-sm text-foreground truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {coursFormateur.formateur.grade} {coursFormateur.formateur.nomPrenom}
                        </div>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80 truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {coursFormateur.cours.titre}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80 truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {coursFormateur.formateur.unite}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80">{formatSimpleDate(coursFormateur.dateDebut)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80">{formatSimpleDate(coursFormateur.dateFin)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className="text-sm text-foreground/80 truncate"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                        >
                          {coursFormateur.reference || "-"}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80">{coursFormateur.nombreHeures}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">{formatDate(coursFormateur.createdAt)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">{formatDate(coursFormateur.updatedAt)}</span>
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
                              onClick={() => handleEditCoursFormateur(coursFormateur)}
                              disabled={!selectedCoursFormateurs.includes(coursFormateur.id)}
                            >
                              <Edit size={14} />
                              <span>Édition</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteClick(coursFormateur)}
                              disabled={!selectedCoursFormateurs.includes(coursFormateur.id)}
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
            Page {currentPage} of {totalPages} • {sortedCoursFormateurs.length} cours formateur{sortedCoursFormateurs.length > 1 ? "s" : ""}
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
              Êtes-vous sûr de vouloir supprimer ce cours formateur ?
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

      <DialogueEditCoursFormateur
        coursFormateur={coursFormateurToEdit}
        isOpen={editDialogOpen}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
