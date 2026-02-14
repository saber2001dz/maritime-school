"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter, usePathname, ReadonlyURLSearchParams } from "next/navigation"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import {
  Download,
  ChevronDown,
  Search,
  X,
  SearchX,
  ArrowDown,
  Check,
  SquarePen,
  UserPlus,
  MoreVertical,
  GraduationCap,
  CirclePlus,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
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
import DialogueFormateur from "@/components/dialogue-formateur"
import DialogueAjouterCoursFormateur, { type Cours, type CoursFormateurData } from "@/components/dialogue-ajouter-cours-formateur"
import { can } from "@/lib/permissions"
import { usePermissions } from "@/lib/permissions-context"

export interface Formateur {
  id: string
  nomPrenom: string
  grade: string
  unite: string
  responsabilite: string
  telephone: number
  RIB: string
}

interface ResizableTableFormateurProps {
  formateurs: Formateur[]
  onFormateurSelect?: (formateurId: string) => void
  onSaveEdit?: (formateur: Formateur) => Promise<{ success: boolean; error?: string }>
  isUpdating?: boolean
  className?: string
  enableAnimations?: boolean
  onAddNewFormateur?: () => void
  searchParams?: ReadonlyURLSearchParams | null
  userRole?: string | null
}

type SortField = "nomPrenom" | "grade" | "unite" | "responsabilite"
type SortOrder = "asc" | "desc"

// Hiérarchie des grades militaires
const RANK_HIERARCHY: Record<string, number> = {
  عميد: 1,
  عقيد: 2,
  مقدم: 3,
  رائد: 4,
  نقيب: 5,
  "ملازم أول": 6,
  "ملازم اول": 6,
  "ملازم 1": 6,
  ملازم: 7,
  "وكيل أول": 8,
  "وكيل اول": 8,
  "وكيل 1": 8,
  وكيل: 9,
  "عريف أول": 10,
  "عريف اول": 10,
  "عريف 1": 10,
  عريف: 11,
  "رقيب أول": 12,
  "رقيب اول": 12,
  "رقيب 1": 12,
  رقيب: 13,
  حرس: 14,
}

const getRankOrder = (rank: string): number => {
  const normalized = rank.trim()
  return RANK_HIERARCHY[normalized] ?? 999
}

const normalizeArabicText = (text: string): string => {
  return text.replace(/[أإآا]/g, "ا").toLowerCase()
}

export function ResizableTableFormateur({
  formateurs: initialFormateurs,
  onFormateurSelect,
  onSaveEdit,
  isUpdating = false,
  className = "",
  enableAnimations = true,
  onAddNewFormateur,
  searchParams,
  userRole,
}: ResizableTableFormateurProps) {
  const permissionsMap = usePermissions()
  const router = useRouter()
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const { addToast } = useToast()

  // Parse URL params for initial state
  const selectedParam = searchParams?.get('selected')
  // Sélection d'une seule ligne : prendre uniquement le premier ID si plusieurs sont présents
  const selectedFromUrl = selectedParam ? [selectedParam.split(',')[0]] : []
  const pageFromUrl = Number(searchParams?.get('page')) || 1
  const sortFromUrl = searchParams?.get('sort') as SortField | null
  const orderFromUrl = (searchParams?.get('order') as SortOrder) || 'asc'
  const gradeFromUrl = searchParams?.get('grade') || null
  const searchFromUrl = searchParams?.get('search') || ''

  const mounted = useRef(false)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [sortField, setSortField] = useState<SortField | null>(sortFromUrl)
  const [sortOrder, setSortOrder] = useState<SortOrder>(orderFromUrl)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [filterGrade, setFilterGrade] = useState<string | null>(gradeFromUrl)
  const [searchQuery, setSearchQuery] = useState<string>(searchFromUrl)
  const [editingFormateur, setEditingFormateur] = useState<Formateur | null>(null)
  const [selectedFormateurs, setSelectedFormateurs] = useState<string[]>(selectedFromUrl)
  const [formateurToDelete, setFormateurToDelete] = useState<Formateur | null>(null)
  const [addCoursDialogOpen, setAddCoursDialogOpen] = useState(false)
  const [formateurForAddCours, setFormateurForAddCours] = useState<Formateur | null>(null)
  const [coursList, setCoursList] = useState<Cours[]>([])
  const [isLoadingCours, setIsLoadingCours] = useState(false)

  // Column width state avec les mêmes largeurs que liste-agent
  const [columnWidths] = useState<Record<string, number>>({
    number: 60,
    name: 235,
    grade: 116,
    unite: 220,
    responsabilite: 240,
    telephone: 146,
    rib: 292,
    actions: 70,
  })

  const ITEMS_PER_PAGE = 10

  // Sync state changes to URL - runs after state updates, not during render
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    const params = new URLSearchParams()

    // Une seule ligne sélectionnée à la fois
    if (selectedFormateurs.length > 0) {
      params.set('selected', selectedFormateurs[0])
    }
    if (currentPage !== 1) {
      params.set('page', String(currentPage))
    }
    if (sortField) {
      params.set('sort', sortField)
      params.set('order', sortOrder)
    }
    if (filterGrade) {
      params.set('grade', filterGrade)
    }
    if (searchQuery) {
      params.set('search', searchQuery)
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl, { scroll: false })
  }, [selectedFormateurs, currentPage, sortField, sortOrder, filterGrade, searchQuery, pathname, router])

  const handleSort = (field: SortField | null) => {
    if (field === null) {
      setSortField(null)
      setSortOrder("asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setShowSortMenu(false)
    setCurrentPage(1)
  }

  const handleFilter = (grade: string | null) => {
    setFilterGrade(grade)
    setShowFilterMenu(false)
    setCurrentPage(1)
  }

  // Liste des grades pour le filtre (même ordre que dans le dialogue)
  const availableGrades = [
    "عميد",
    "عقيد",
    "مقدم",
    "رائد",
    "نقيب",
    "ملازم أول",
    "ملازم",
    "عريف أول",
    "عريف",
    "وكيل أول",
    "وكيل",
    "رقيب أول",
    "رقيب",
    "حرس",
  ]

  const sortedAndFilteredFormateurs = useMemo(() => {
    let filtered = [...initialFormateurs]

    // Filter by search query (nom et prénom)
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeArabicText(searchQuery)
      filtered = filtered.filter((f) => normalizeArabicText(f.nomPrenom).includes(normalizedQuery))
    }

    // Filter by grade
    if (filterGrade) {
      filtered = filtered.filter((f) => f.grade === filterGrade)
    }

    // Sort - si sortField est null, tri par défaut par grade
    if (!sortField) {
      return filtered.sort((a, b) => {
        const aRank = getRankOrder(a.grade)
        const bRank = getRankOrder(b.grade)
        return aRank - bRank
      })
    }

    return filtered.sort((a, b) => {
      if (sortField === "grade") {
        const aRank = getRankOrder(a.grade)
        const bRank = getRankOrder(b.grade)
        return sortOrder === "asc" ? aRank - bRank : bRank - aRank
      }

      let aVal: string | number = a[sortField]
      let bVal: string | number = b[sortField]

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [initialFormateurs, sortField, sortOrder, filterGrade, searchQuery])

  const paginatedFormateurs = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedAndFilteredFormateurs.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [sortedAndFilteredFormateurs, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredFormateurs.length / ITEMS_PER_PAGE)

  const formatPhoneNumber = (phone: number) => {
    const phoneStr = phone.toString()
    if (phoneStr.length === 8) {
      return `${phoneStr.slice(0, 2)} ${phoneStr.slice(2, 5)} ${phoneStr.slice(5, 8)}`
    }
    return phoneStr
  }

  const exportToCSV = () => {
    const headers = ["RIB", "رقم الهاتف", "المسؤولية", "الوحدة", "الرتبة", "الإسم و اللقب"]
    const rows = sortedAndFilteredFormateurs.map((formateur) => [
      formateur.RIB,
      formateur.telephone,
      formateur.responsabilite,
      formateur.unite,
      formateur.grade,
      formateur.nomPrenom,
    ])

    const BOM = "\uFEFF"
    const RTL_MARK = "\u200F"
    const csvContent = [
      RTL_MARK + headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${RTL_MARK}${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `formateurs-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(sortedAndFilteredFormateurs, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `formateurs-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const exportToExcel = () => {
    const excelData = sortedAndFilteredFormateurs.map((formateur) => ({
      "الإسم و اللقب": formateur.nomPrenom,
      "الرتبة": formateur.grade,
      "الوحدة": formateur.unite,
      "المسؤولية": formateur.responsabilite,
      "رقم الهاتف": formateur.telephone,
      "RIB": formateur.RIB,
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "المكونين")

    if (!worksheet["!cols"]) worksheet["!cols"] = []
    worksheet["!cols"] = [
      { wch: 25 }, // الإسم و اللقب
      { wch: 12 }, // الرتبة
      { wch: 20 }, // الوحدة
      { wch: 25 }, // المسؤولية
      { wch: 12 }, // رقم الهاتف
      { wch: 22 }, // RIB
    ]

    XLSX.writeFile(workbook, `formateurs-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handleEditClick = async (formateur: Formateur) => {
    setEditingFormateur(formateur)
  }

  const handleSaveEditInternal = async (data: Formateur) => {
    if (!onSaveEdit) return

    const result = await onSaveEdit(data)

    if (result.success) {
      addToast({
        title: "نجـاح العمليـة",
        description: "تم حفظ البيانات بنجاح",
        variant: "success",
      })
      setEditingFormateur(null)
    } else {
      addToast({
        title: "خطأ",
        description: result.error || "حدث خطأ أثناء حفظ البيانات",
        variant: "error",
      })
    }
  }

  const handleFormateurSelect = (formateurId: string) => {
    // Sélectionner une seule ligne à la fois, ou décocher si déjà sélectionné
    setSelectedFormateurs((prev) => {
      if (prev.includes(formateurId)) {
        return [] // Décocher
      } else {
        return [formateurId] // Sélectionner uniquement cette ligne
      }
    })
  }

  const handleDeleteClick = (formateur: Formateur) => {
    setFormateurToDelete(formateur)
  }

  const handleConfirmDelete = async () => {
    if (!formateurToDelete) return

    try {
      const response = await fetch(`/api/formateurs/${formateurToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du formateur")
      }

      addToast({
        title: "نجـاح العمليـة",
        description: "تم حذف المكون بنجاح",
        variant: "success",
      })

      setFormateurToDelete(null)
      setSelectedFormateurs((prev) => prev.filter((id) => id !== formateurToDelete.id))

      // Si c'est la dernière ligne de la page actuelle et qu'on n'est pas sur la page 1,
      // revenir à la page précédente
      if (paginatedFormateurs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }

      router.refresh()
    } catch (err: any) {
      addToast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء حذف المكون",
        variant: "error",
      })
    }
  }

  const handleOpenAddCoursDialog = async (formateur: Formateur) => {
    setFormateurForAddCours(formateur)
    setIsLoadingCours(true)
    setAddCoursDialogOpen(true)

    try {
      const response = await fetch('/api/cours')
      if (!response.ok) throw new Error('Erreur de chargement')
      const data = await response.json()
      setCoursList(data)
    } catch (err: any) {
      addToast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل قائمة الدروس",
        variant: "error",
      })
    } finally {
      setIsLoadingCours(false)
    }
  }

  const handleSaveAddCours = async (data: CoursFormateurData) => {
    if (!formateurForAddCours) return

    try {
      const response = await fetch('/api/cours-formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formateurId: formateurForAddCours.id,
          coursId: data.coursId,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          nombreHeures: data.nombreHeures,
          reference: data.reference,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'ajout')
      }

      addToast({
        title: "نجـاح العمليـة",
        description: "تم إضافة الدرس بنجاح",
        variant: "success",
      })

      setAddCoursDialogOpen(false)
      setFormateurForAddCours(null)
      router.refresh()
    } catch (err: any) {
      addToast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء إضافة الدرس",
        variant: "error",
      })
    }
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
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full max-w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="بــحــث حــســب الهــويــة . . ."
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
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
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
              ترتــيــب{" "}
              {sortField && (
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
                      sortField === null ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>إلغــــاء التــرتيـــب</span>
                    {sortField === null && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("nomPrenom")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "nomPrenom" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>الإســـم و اللــقـــب</span>
                    {sortField === "nomPrenom" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("unite")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "unite" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>الــوحــــــــــــــــدة</span>
                    {sortField === "unite" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("responsabilite")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "responsabilite" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>المســــؤولـيــــة</span>
                    {sortField === "responsabilite" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer ${
                filterGrade ? "ring-2 ring-primary/30" : ""
              }`}
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3H14M4 8H12M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              تـصـفـيـة
              {filterGrade && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 pt-1">1</span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => handleFilter(null)}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      !filterGrade ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>كل الرتب</span>
                    {!filterGrade && <Check className="h-4 w-4 text-primary" />}
                  </button>

                  {availableGrades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => handleFilter(grade)}
                      className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        filterGrade === grade ? "bg-muted/30" : ""
                      }`}
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      <span>{grade}</span>
                      {filterGrade === grade && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

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
                      exportToExcel()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 border-t border-border/30"
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

          {onAddNewFormateur && can(userRole, "formateur", "create", permissionsMap) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onAddNewFormateur}
                  className="ml-1 p-2 border border-border text-sm transition-colors flex items-center justify-center rounded-md cursor-pointer bg-slate-100 text-[#06407F] hover:bg-slate-200 dark:bg-blue-950/40 dark:text-foreground/90 dark:hover:bg-blue-950/60"
                  aria-label="إضافة مكون جديد"
                >
                  <UserPlus size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>إضافة مكون جديد</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div
        className={`bg-background overflow-hidden rounded-lg relative ${
          "border border-zinc-300 dark:border-zinc-600"
        }`}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div
              className="flex py-3 text-xs font-semibold text-[#06407F] dark:text-foreground/90 bg-slate-100 border-b border-zinc-300 dark:bg-blue-950/40 dark:border-zinc-600"
            >
              <div
                className={`flex items-center justify-center ${
                  "border-l border-zinc-300 dark:border-zinc-600"
                }`}
                style={{ width: columnWidths.number }}
              >
                <span className="text-xs font-semibold">#</span>
              </div>

              <div
                className={`flex items-center px-3 relative gap-1.5 ${
                  "border-l border-zinc-300 dark:border-zinc-600"
                }`}
                style={{ width: columnWidths.name }}
              >
                <span>الإســم و اللـقـــب</span>
                {sortField === "nomPrenom" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  "border-l border-zinc-300 dark:border-zinc-600"
                }`}
                style={{ width: columnWidths.grade }}
              >
                <span>الـــــرتــبـــــة</span>
              </div>

              <div
                className={`flex items-center px-3 relative gap-1.5 ${
                  "border-l border-zinc-300 dark:border-zinc-600"
                }`}
                style={{ width: columnWidths.unite }}
              >
                <span>الــــوحـــــــدة</span>
                {sortField === "unite" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
              </div>

              <div
                className={`flex items-center px-3 relative gap-1.5 ${
                  "border-l border-zinc-300 dark:border-zinc-600"
                }`}
                style={{ width: columnWidths.responsabilite }}
              >
                <span>المســـؤولــيــــة</span>
                {sortField === "responsabilite" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  "border-l border-zinc-300 dark:border-zinc-600"
                }`}
                style={{ width: columnWidths.telephone }}
              >
                <span>رقــم الهــاتــف</span>
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  "border-l border-zinc-300 dark:border-zinc-600"
                }`}
                style={{ width: columnWidths.rib }}
              >
                <span>رقــم الحســاب البـنـكـي</span>
              </div>

              <div className="flex items-center justify-center px-3 relative" style={{ width: columnWidths.actions }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-50">
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="13" cy="8" r="1" fill="currentColor" />
                  <circle cx="3" cy="8" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}-filter-${filterGrade || "all"}-sort-${
                  sortField || "none"
                }-search-${searchQuery}`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedFormateurs.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex justify-center mb-4">
                      <SearchX className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div
                      className="text-muted-foreground/70 text-sm"
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      {searchQuery ? `لا توجد نتائج للبحث عن "${searchQuery}"` : "لا توجد نتائج"}
                    </div>
                    <div
                      className="text-muted-foreground/50 text-xs mt-2"
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      حاول البحث بمعايير أخرى
                    </div>
                  </div>
                ) : (
                  <>
                    {paginatedFormateurs.map((formateur, index) => {
                      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                      const isSelected = selectedFormateurs.includes(formateur.id)
                      return (
                        <motion.div key={formateur.id} variants={shouldAnimate ? rowVariants : {}}>
                          <div
                            className={`py-3.5 group relative transition-all duration-150 flex ${
                              isSelected
                                ? "bg-gray-300/40 dark:bg-zinc-700/60"
                                : "bg-muted/5 hover:bg-muted/20 dark:bg-card"
                            } border-b border-zinc-200 dark:border-zinc-600`}
                          >
                            <div
                              className={`flex items-center justify-center ${
                                "border-l border-zinc-200 dark:border-zinc-600"
                              }`}
                              style={{ width: columnWidths.number }}
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-border/40 cursor-pointer"
                                style={{ accentColor: "rgb(161, 161, 170)" }}
                                checked={selectedFormateurs.includes(formateur.id)}
                                onChange={() => handleFormateurSelect(formateur.id)}
                              />
                            </div>

                            <div
                              className={`flex items-center min-w-0 px-3 ${
                                "border-l border-zinc-200 dark:border-zinc-600"
                              }`}
                              style={{ width: columnWidths.name }}
                            >
                              <span
                                className="text-sm text-foreground truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {formateur.nomPrenom}
                              </span>
                            </div>

                            <div
                              className={`flex items-center min-w-0 px-3 ${
                                "border-l border-zinc-200 dark:border-zinc-600"
                              }`}
                              style={{ width: columnWidths.grade }}
                            >
                              <span
                                className="text-sm text-foreground/80 truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {formateur.grade}
                              </span>
                            </div>

                            <div
                              className={`flex items-center px-3 ${
                                "border-l border-zinc-200 dark:border-zinc-600"
                              }`}
                              style={{ width: columnWidths.unite }}
                            >
                              <span
                                className="text-sm text-foreground/80 truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {formateur.unite}
                              </span>
                            </div>

                            <div
                              className={`flex items-center min-w-0 px-3 ${
                                "border-l border-zinc-200 dark:border-zinc-600"
                              }`}
                              style={{ width: columnWidths.responsabilite }}
                            >
                              <span
                                className="text-sm text-foreground/80 truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {formateur.responsabilite}
                              </span>
                            </div>

                            <div
                              className={`flex items-center px-3 ${
                                "border-l border-zinc-200 dark:border-zinc-600"
                              }`}
                              style={{ width: columnWidths.telephone }}
                            >
                              <span className="text-sm text-foreground/70 font-mono" dir="ltr">
                                {formatPhoneNumber(formateur.telephone)}
                              </span>
                            </div>

                            <div
                              className={`flex items-center px-3 ${
                                "border-l border-zinc-200 dark:border-zinc-600"
                              }`}
                              style={{ width: columnWidths.rib }}
                            >
                              <span className="text-sm text-foreground/70 font-mono" dir="ltr">
                                {formateur.RIB}
                              </span>
                            </div>

                            <div className="flex items-center justify-center" style={{ width: columnWidths.actions }}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex items-center">
                                    <MoreVertical size={16} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" side="bottom">
                                  {can(userRole, "formateur", "edit", permissionsMap) && (
                                    <DropdownMenuItem
                                      dir="rtl"
                                      className="gap-2 cursor-pointer"
                                      onClick={() => handleEditClick(formateur)}
                                      disabled={!selectedFormateurs.includes(formateur.id)}
                                    >
                                      <SquarePen size={14} />
                                      <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                        تعــديــل البيــانـــات
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                  {can(userRole, "coursFormateur", "view", permissionsMap) && (
                                    <DropdownMenuItem
                                      dir="rtl"
                                      className="gap-2 cursor-pointer"
                                      onClick={() => {
                                        if (selectedFormateurs.includes(formateur.id)) {
                                          // Preserve current URL params
                                          const params = new URLSearchParams(searchParams?.toString())
                                          const returnUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
                                          router.push(`/cours-formateur?formateurId=${formateur.id}&returnUrl=${encodeURIComponent(returnUrl)}`)
                                        }
                                      }}
                                      disabled={!selectedFormateurs.includes(formateur.id)}
                                    >
                                      <GraduationCap size={14} />
                                      <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                        قــائمـــة الـــــدروس
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                  {can(userRole, "coursFormateur", "create", permissionsMap) && (
                                    <DropdownMenuItem
                                      dir="rtl"
                                      className="gap-2 cursor-pointer"
                                      onClick={() => {
                                        if (selectedFormateurs.includes(formateur.id)) {
                                          handleOpenAddCoursDialog(formateur)
                                        }
                                      }}
                                      disabled={!selectedFormateurs.includes(formateur.id)}
                                    >
                                      <CirclePlus size={14} />
                                      <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                        إضــــــــافـــــة درس
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                  {can(userRole, "formateur", "delete", permissionsMap) && (
                                    <DropdownMenuItem
                                      dir="rtl"
                                      className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                      onClick={() => handleDeleteClick(formateur)}
                                      disabled={!selectedFormateurs.includes(formateur.id)}
                                    >
                                      <Trash2 size={14} />
                                      <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                        حـــــــــــــــــــــــذف
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {sortedAndFilteredFormateurs.length > 0 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
            الصفحــة {currentPage} مــن {totalPages} - ({sortedAndFilteredFormateurs.length}{" "}
            {sortedAndFilteredFormateurs.length < 11 ? "مكونين" : "مكــون"})
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

      {/* Dialog d'édition */}
      <DialogueFormateur
        formateur={editingFormateur || undefined}
        isOpen={!!editingFormateur}
        onClose={() => setEditingFormateur(null)}
        onSave={handleSaveEditInternal}
        isUpdating={isUpdating}
      />

      {/* Dialog d'ajout de cours */}
      <DialogueAjouterCoursFormateur
        formateur={formateurForAddCours || undefined}
        coursList={coursList}
        isOpen={addCoursDialogOpen}
        onClose={() => {
          setAddCoursDialogOpen(false)
          setFormateurForAddCours(null)
        }}
        onSave={handleSaveAddCours}
        isCreating={isUpdating}
        isLoadingCours={isLoadingCours}
      />

      {/* AlertDialog de confirmation de suppression */}
      <AlertDialog open={!!formateurToDelete} onOpenChange={(open) => !open && setFormateurToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }} className="text-right">
              تأكيــد الحـــذف
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
              className="text-right py-5"
            >
              هل أنت متأكد من حذف المكون{" "}
              <span className="font-semibold text-foreground">{formateurToDelete?.nomPrenom}</span>؟ لا يمكن التراجع عن
              هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="cursor-pointer" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
              إلغــاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              حــــــذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function ResizableTableFormateurWithToast(props: ResizableTableFormateurProps) {
  return (
    <ToastProvider>
      <ResizableTableFormateur {...props} />
    </ToastProvider>
  )
}
