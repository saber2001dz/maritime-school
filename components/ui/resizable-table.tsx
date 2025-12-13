"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname, ReadonlyURLSearchParams } from "next/navigation"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Download,
  ChevronDown,
  Search,
  X,
  SearchX,
  ArrowDown,
  Check,
  SquarePen,
  GraduationCap,
  CirclePlus,
  UserPlus,
  MoreVertical,
  Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import NeumorphButton from "@/components/ui/neumorph-button"
import DialogueStyle from "@/components/dialogue-agent"
import DialogueAgentFormation, { type Formation } from "@/components/dialogue-agent-formation"
import { ToastProvider, useToast } from "@/components/ui/ultra-quality-toast"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export interface Agent {
  id: string
  nomPrenom: string
  grade: string
  matricule: string
  responsabilite: string
  telephone: number
  derniereDateFormation: string
  categorie: "ضابط سامي" | "ضابط" | "ضابط صف" | "هيئة الرقباء"
  avatar?: string
}

interface ResizableTableProps {
  title?: string
  agents: Agent[]
  onAgentSelect?: (agentId: string) => void
  onColumnResize?: (columnKey: string, newWidth: number) => void
  onSaveEdit?: (agent: Agent) => Promise<{ success: boolean; error?: string }>
  onFormationSaved?: () => void
  isUpdating?: boolean
  className?: string
  enableAnimations?: boolean
  onAddNewAgent?: () => void
  searchParams?: ReadonlyURLSearchParams | null
}

type SortField = "nomPrenom" | "categorie" | "derniereDateFormation" | "grade"
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

// Fonction pour normaliser et obtenir la position du grade
const getRankOrder = (rank: string): number => {
  const normalized = rank.trim()
  return RANK_HIERARCHY[normalized] ?? 999 // 999 pour les grades non reconnus
}

// Fonction pour normaliser les lettres arabes pour la recherche
const normalizeArabicText = (text: string): string => {
  return text
    .replace(/[أإآا]/g, "ا") // Normaliser toutes les variantes de alif en alif simple
    .toLowerCase()
}

// Fonction pour déterminer la catégorie basée sur le grade
const getCategorieFromGrade = (grade: string): "ضابط سامي" | "ضابط" | "ضابط صف" | "هيئة الرقباء" => {
  const normalized = grade.trim()

  // ضابط سامي: عميد - عقيد - مقدم - رائد
  if (["عميد", "عقيد", "مقدم", "رائد"].includes(normalized)) {
    return "ضابط سامي"
  }

  // ضابط: ملازم - ملازم أول - نقيب
  if (["ملازم", "ملازم أول", "ملازم اول", "ملازم 1", "نقيب"].includes(normalized)) {
    return "ضابط"
  }

  // ضابط صف: وكيل أول - وكيل - عريف أول - عريف
  if (["وكيل أول", "وكيل اول", "وكيل 1", "وكيل", "عريف أول", "عريف اول", "عريف 1", "عريف"].includes(normalized)) {
    return "ضابط صف"
  }

  // هيئة الرقباء: حرس - رقيب أول - رقيب
  if (["حرس", "رقيب أول", "رقيب اول", "رقيب 1", "رقيب"].includes(normalized)) {
    return "هيئة الرقباء"
  }

  // Par défaut, retourner ضابط صف
  return "ضابط صف"
}

export function ResizableTable({
  title = "Agent",
  agents: initialAgents,
  onAgentSelect,
  onColumnResize,
  onSaveEdit,
  onFormationSaved,
  isUpdating = false,
  className = "",
  enableAnimations = true,
  onAddNewAgent,
  searchParams,
}: ResizableTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const { addToast } = useToast()

  // Parse URL params for initial state
  const selectedParam = searchParams?.get('selected')
  // Sélection d'une seule ligne : prendre uniquement le premier ID si plusieurs sont présents
  const selectedFromUrl = selectedParam ? [selectedParam.split(',')[0]] : []
  const pageFromUrl = Number(searchParams?.get('page')) || 1
  const sortFromUrl = searchParams?.get('sort') as SortField | null
  const orderFromUrl = (searchParams?.get('order') as SortOrder) || 'asc'
  const categorieFromUrl = searchParams?.get('categorie') || null
  const searchFromUrl = searchParams?.get('search') || ''
  const matriculeFromUrl = searchParams?.get('matricule') || ''

  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const [sortField, setSortField] = useState<SortField | null>(sortFromUrl)
  const [sortOrder, setSortOrder] = useState<SortOrder>(orderFromUrl)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(categorieFromUrl)
  const [searchQuery, setSearchQuery] = useState<string>(searchFromUrl)
  const [searchMatricule, setSearchMatricule] = useState<string>(matriculeFromUrl)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [addingFormationAgent, setAddingFormationAgent] = useState<Agent | null>(null)
  const [formationFormData, setFormationFormData] = useState<{
    formationId: string
    dateDebut: string
    dateFin: string
    reference: string
    resultat: string
    moyenne: number
  } | null>(null)
  const [formationError, setFormationError] = useState<string | null>(null)
  const [availableFormations, setAvailableFormations] = useState<Formation[]>([])
  const [isLoadingFormations, setIsLoadingFormations] = useState(false)
  const [isSavingFormation, setIsSavingFormation] = useState(false)
  const [selectedAgents, setSelectedAgents] = useState<string[]>(selectedFromUrl)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

  // Column width state with default values
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    number: 60, // Checkbox column (was row number column)
    name: 225, // Increased for name (الإسم و اللقب)
    email: 125, // Reduced for rank (الرتبة)
    department: 120, // Reduced for department (الرقم)
    position: 240, // Increased for position (المسؤولية)
    salary: 136, // +6 pixels
    hireDate: 156, // +6 pixels
    status: 146, // Reduced by 30 pixels (166 - 30 = 136)
    actions: 40, // Minimum width for dropdown trigger icon
  })

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync state changes to URL - runs after state updates, not during render
  useEffect(() => {
    if (!mounted) return // Don't run on initial mount

    const params = new URLSearchParams()

    // Une seule ligne sélectionnée à la fois
    if (selectedAgents.length > 0) {
      params.set('selected', selectedAgents[0])
    }
    if (currentPage !== 1) {
      params.set('page', String(currentPage))
    }
    if (sortField) {
      params.set('sort', sortField)
      params.set('order', sortOrder)
    }
    if (filterStatus) {
      params.set('categorie', filterStatus)
    }
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    if (searchMatricule) {
      params.set('matricule', searchMatricule)
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl, { scroll: false })
  }, [selectedAgents, currentPage, sortField, sortOrder, filterStatus, searchQuery, searchMatricule, pathname, router, mounted])

  const handleSort = (field: SortField | null) => {
    if (field === null) {
      setSortField(null)
      setSortOrder("asc")
    } else {
      setSortField(field)
      if (field === "derniereDateFormation") {
        setSortOrder("desc")
      } else {
        setSortOrder("asc")
      }
    }
    setShowSortMenu(false)
    setCurrentPage(1)
  }

  const handleFilter = (status: string | null) => {
    setFilterStatus(status)
    setShowFilterMenu(false)
    setCurrentPage(1)
  }

  const handleAgentSelect = (agentId: string) => {
    // Sélectionner une seule ligne à la fois, ou décocher si déjà sélectionné
    setSelectedAgents((prev) => {
      if (prev.includes(agentId)) {
        return [] // Décocher
      } else {
        return [agentId] // Sélectionner uniquement cette ligne
      }
    })
  }

  const handleDeleteClick = (agent: Agent) => {
    if (!selectedAgents.includes(agent.id)) {
      return
    }
    setAgentToDelete(agent)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return

    try {
      const response = await fetch(`/api/agents/${agentToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      addToast({
        variant: "success",
        title: "نجـاح العمليـة",
        description: "تم حذف البيانات بنجاح",
      })

      setDeleteDialogOpen(false)
      setAgentToDelete(null)
      setSelectedAgents((prev) => prev.filter((id) => id !== agentToDelete.id))

      // Refresh data
      if (onFormationSaved) {
        onFormationSaved()
      }
    } catch (error) {
      addToast({
        variant: "error",
        title: "خطأ",
        description: "حدث خطأ أثناء حذف البيانات",
      })
    }
  }

  const sortedAndFilteredAgents = useMemo(() => {
    let filtered = [...initialAgents]

    // Filter by search query (nom et prénom)
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeArabicText(searchQuery)
      filtered = filtered.filter((e) => normalizeArabicText(e.nomPrenom).includes(normalizedQuery))
    }

    // Filter by matricule (commence par les chiffres saisis)
    if (searchMatricule.trim()) {
      filtered = filtered.filter((e) => e.matricule.startsWith(searchMatricule))
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((e) => e.categorie === filterStatus)
    }

    // Sort
    // Si sortField est null, appliquer le tri par défaut selon الرتبة (grade)
    if (!sortField) {
      return filtered.sort((a, b) => {
        const aRank = getRankOrder(a.grade)
        const bRank = getRankOrder(b.grade)
        return aRank - bRank // Toujours ascendant (du grade le plus élevé au plus bas)
      })
    }

    return filtered.sort((a, b) => {
      // Tri spécial pour les grades
      if (sortField === "grade") {
        const aRank = getRankOrder(a.grade)
        const bRank = getRankOrder(b.grade)
        return sortOrder === "asc" ? aRank - bRank : bRank - aRank
      }

      let aVal: string | number = a[sortField]
      let bVal: string | number = b[sortField]

      if (sortField === "derniereDateFormation") {
        aVal = new Date(a.derniereDateFormation).getTime()
        bVal = new Date(b.derniereDateFormation).getTime()
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [initialAgents, sortField, sortOrder, filterStatus, searchQuery, searchMatricule])

  const paginatedAgents = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedAndFilteredAgents.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [sortedAndFilteredAgents, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredAgents.length / ITEMS_PER_PAGE)

  const getStatusColor = (status: string) => {
    if (!mounted) {
      const statusMap: Record<string, { bgColor: string; borderColor: string; textColor: string; dotColor: string }> = {
        "ضابط سامي": {
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/30",
          textColor: "text-purple-400",
          dotColor: "bg-purple-400",
        },
        ضابط: {
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          textColor: "text-blue-400",
          dotColor: "bg-blue-400",
        },
        "ضابط صف": {
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          textColor: "text-green-400",
          dotColor: "bg-green-400",
        },
        "هيئة الرقباء": {
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/30",
          textColor: "text-orange-400",
          dotColor: "bg-orange-400",
        },
      }
      return statusMap[status]
    }

    const statusMap: Record<string, { bgColor: string; borderColor: string; textColor: string; dotColor: string }> = {
      "ضابط سامي": {
        bgColor: isDark ? "bg-purple-500/10" : "bg-purple-50",
        borderColor: isDark ? "border-purple-500/30" : "border-purple-200",
        textColor: isDark ? "text-purple-400" : "text-purple-600",
        dotColor: isDark ? "bg-purple-400" : "bg-purple-600",
      },
      ضابط: {
        bgColor: isDark ? "bg-blue-500/10" : "bg-blue-50",
        borderColor: isDark ? "border-blue-500/30" : "border-blue-200",
        textColor: isDark ? "text-blue-400" : "text-blue-600",
        dotColor: isDark ? "bg-blue-400" : "bg-blue-600",
      },
      "ضابط صف": {
        bgColor: isDark ? "bg-green-500/10" : "bg-green-50",
        borderColor: isDark ? "border-green-500/30" : "border-green-200",
        textColor: isDark ? "text-green-400" : "text-green-600",
        dotColor: isDark ? "bg-green-400" : "bg-green-600",
      },
      "هيئة الرقباء": {
        bgColor: isDark ? "bg-orange-500/10" : "bg-orange-50",
        borderColor: isDark ? "border-orange-500/30" : "border-orange-200",
        textColor: isDark ? "text-orange-400" : "text-orange-600",
        dotColor: isDark ? "bg-orange-400" : "bg-orange-600",
      },
    }

    return statusMap[status]
  }

  const formatPhoneNumber = (phone: number) => {
    const phoneStr = phone.toString()
    // Format: XX XXX XXX
    if (phoneStr.length === 8) {
      return `${phoneStr.slice(0, 2)} ${phoneStr.slice(2, 5)} ${phoneStr.slice(5, 8)}`
    }
    return phoneStr
  }

  const exportToCSV = () => {
    // Headers in RTL order (right to left)
    const headers = ["الفئة", "آخر تكوين", "رقم الهاتف", "المسؤولية", "الرقم", "الرتبة", "الإسم و اللقب"]
    const rows = sortedAndFilteredAgents.map((agent) => [
      agent.categorie,
      agent.derniereDateFormation,
      agent.telephone,
      agent.responsabilite,
      agent.matricule,
      agent.grade,
      agent.nomPrenom,
    ])

    // Add BOM for proper UTF-8 encoding and RTL mark
    const BOM = "\uFEFF"
    const RTL_MARK = "\u200F" // Right-to-left mark
    const csvContent = [
      RTL_MARK + headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${RTL_MARK}${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
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

  const handleEditClick = (agent: Agent) => {
    setEditingAgent(agent)
  }

  const handleCancelEdit = () => {
    setEditingAgent(null)
  }

  const handleAddFormationClick = async (agent: Agent) => {
    setAddingFormationAgent(agent)
    setFormationFormData({
      formationId: "",
      dateDebut: "",
      dateFin: "",
      reference: "",
      resultat: "",
      moyenne: 0,
    })

    // Charger les formations disponibles
    setIsLoadingFormations(true)
    try {
      const response = await fetch("/api/formations")
      if (response.ok) {
        const formations = await response.json()
        setAvailableFormations(formations)
      }
    } catch (error) {
      console.error("Error loading formations:", error)
    } finally {
      setIsLoadingFormations(false)
    }
  }

  const handleFormationFormChange = (field: string, value: string | number) => {
    if (formationFormData) {
      setFormationFormData({
        ...formationFormData,
        [field]: value,
      })
    }
  }

  const handleSaveFormation = async () => {
    if (formationFormData && addingFormationAgent) {
      setFormationError(null)

      // Validation
      if (!formationFormData.formationId) {
        addToast({
          variant: "warning",
          title: "تحذير",
          description: "الرجاء اختيار الدورة التكوينية",
        })
        return
      }
      if (!formationFormData.dateDebut) {
        addToast({
          variant: "warning",
          title: "تحذير",
          description: "الرجاء إدخال تاريخ بداية التكوين",
        })
        return
      }
      if (!formationFormData.dateFin) {
        addToast({
          variant: "warning",
          title: "تحذير",
          description: "الرجاء إدخال تاريخ نهاية التكوين",
        })
        return
      }
      if (formationFormData.moyenne < 0 || formationFormData.moyenne > 20) {
        addToast({
          variant: "warning",
          title: "تحذير",
          description: "المعدل يجب أن يكون بين 0 و 20",
        })
        return
      }

      // Enregistrer la formation dans la base de données
      setIsSavingFormation(true)
      try {
        const response = await fetch("/api/agent-formations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId: addingFormationAgent.id,
            formationId: formationFormData.formationId,
            dateDebut: formationFormData.dateDebut,
            dateFin: formationFormData.dateFin,
            reference: formationFormData.reference?.trim() || "",
            resultat: formationFormData.resultat,
            moyenne: formationFormData.moyenne,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de l'enregistrement de la formation")
        }

        // Succès - afficher toast et fermer le dialog
        addToast({
          variant: "success",
          title: "نجـاح العمليـة",
          description: "تم حفظ البيانات بنجاح",
        })

        setAddingFormationAgent(null)
        setFormationFormData(null)

        // Rafraîchir les données de la page sans reload complet
        if (onFormationSaved) {
          onFormationSaved()
        }
      } catch (error: any) {
        addToast({
          variant: "error",
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ البيانات",
        })
      } finally {
        setIsSavingFormation(false)
      }
    }
  }

  const handleCancelFormation = () => {
    setAddingFormationAgent(null)
    setFormationFormData(null)
    setFormationError(null)
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

          <div className="relative w-full max-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="بــحــث حــســب الـرقـــم . . ."
              value={searchMatricule}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "")
                setSearchMatricule(value)
                setCurrentPage(1)
              }}
              className="pr-9 pl-9 focus-visible:ring-1"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            />
            {searchMatricule && (
              <button
                onClick={() => {
                  setSearchMatricule("")
                  setCurrentPage(1)
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search matricule"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DialogueStyle />

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
                    onClick={() => handleSort("categorie")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "categorie" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>الفــــــئـــــــــــــــــة</span>
                    {sortField === "categorie" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("derniereDateFormation")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "derniereDateFormation" ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>آخـــــر تكـــويـــــن</span>
                    {sortField === "derniereDateFormation" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer ${
                filterStatus ? "ring-2 ring-primary/30" : ""
              }`}
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3H14M4 8H12M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              تـصـفـيـة
              {filterStatus && (
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
                      !filterStatus ? "bg-muted/30" : ""
                    }`}
                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                  >
                    <span>كل الفئات</span>
                    {!filterStatus && <Check className="h-4 w-4 text-primary" />}
                  </button>

                  {["ضابط سامي", "ضابط", "ضابط صف", "هيئة الرقباء"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilter(status)}
                      className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        filterStatus === status ? "bg-muted/30" : ""
                      }`}
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      <span>{status}</span>
                      {filterStatus === status && <Check className="h-4 w-4 text-primary" />}
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

          {onAddNewAgent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onAddNewAgent}
                  className={`ml-1 p-2 border border-border text-sm transition-colors flex items-center justify-center rounded-md cursor-pointer ${
                    mounted
                      ? isDark
                        ? "bg-blue-950/40 text-foreground/90 hover:bg-blue-950/60"
                        : "bg-slate-100 text-[#06407F] hover:bg-slate-200"
                      : "bg-muted/5 text-foreground hover:bg-muted/10"
                  }`}
                  aria-label="إضافة متربص جديد"
                >
                  <UserPlus size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>إضافة متربص جديد</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div
        className={`bg-background overflow-hidden rounded-lg relative ${
          mounted ? (isDark ? "border border-zinc-600" : "border border-zinc-300") : "border-2 border-border"
        }`}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
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
                style={{ width: columnWidths.name }}
              >
                <span>الإســم و اللـقـــب</span>
                {sortField === "nomPrenom" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.email }}
              >
                <span>الـــــرتــبـــــة</span>
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.department }}
              >
                <span>الــــرقــــــــم</span>
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.position }}
              >
                <span>المســـؤولــيــــة</span>
              </div>

              <div
                className={`flex items-center px-3 relative ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.salary }}
              >
                <span>رقــم الهــاتــف</span>
              </div>

              <div
                className={`flex items-center px-3 relative gap-1.5 ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.hireDate }}
              >
                <span>آخـــر تكــويــــن</span>
                {sortField === "derniereDateFormation" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
              </div>

              <div
                className={`flex items-center px-3 relative gap-1.5 ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-300"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.status }}
              >
                <span>الفـــئــــــة</span>
                {sortField === "categorie" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
              </div>

              <div
                className="flex mr-3 items-center justify-center px-3 relative"
                style={{ width: columnWidths.actions }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-50">
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="13" cy="8" r="1" fill="currentColor" />
                  <circle cx="3" cy="8" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}-filter-${filterStatus || "all"}-sort-${
                  sortField || "none"
                }-search-${searchQuery}-matricule-${searchMatricule}`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedAgents.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex justify-center mb-4">
                      <SearchX className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div
                      className="text-muted-foreground/70 text-sm"
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      {searchQuery && searchMatricule
                        ? `لا توجد نتائج للبحث عن "${searchQuery}" و الرقم "${searchMatricule}"`
                        : searchQuery
                        ? `لا توجد نتائج للبحث عن "${searchQuery}"`
                        : searchMatricule
                        ? `لا توجد نتائج للبحث عن الرقم "${searchMatricule}"`
                        : "لا توجد نتائج"}
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
                    {paginatedAgents.map((agent) => {
                      return (
                        <motion.div key={agent.id} variants={shouldAnimate ? rowVariants : {}}>
                          <div
                            className={`py-3.5 group relative transition-all duration-150 flex ${
                              selectedAgents.includes(agent.id)
                                ? isDark
                                  ? "bg-zinc-700/60"
                                  : "bg-gray-300/40"
                                : "bg-muted/5 hover:bg-muted/20"
                            } ${
                              mounted
                                ? isDark
                                  ? "border-b border-zinc-600"
                                  : "border-b border-zinc-200"
                                : "border-b-2 border-border"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.number }}
                            >
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

                            <div
                              className={`flex items-center min-w-0 px-3 ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.name }}
                            >
                              <span
                                className="text-sm text-foreground truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {agent.nomPrenom}
                              </span>
                            </div>

                            <div
                              className={`flex items-center min-w-0 px-3 ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.email }}
                            >
                              <span
                                className="text-sm text-foreground/80 truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {agent.grade}
                              </span>
                            </div>

                            <div
                              className={`flex items-center px-3 ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.department }}
                            >
                              <span
                                className="text-sm text-foreground/80 truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {agent.matricule}
                              </span>
                            </div>

                            <div
                              className={`flex items-center min-w-0 px-3 ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.position }}
                            >
                              <span
                                className="text-sm text-foreground/80 truncate"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {agent.responsabilite}
                              </span>
                            </div>

                            <div
                              className={`flex items-center px-3 ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.salary }}
                            >
                              <span
                                className="text-sm text-foreground/90"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                                dir="ltr"
                              >
                                {formatPhoneNumber(agent.telephone)}
                              </span>
                            </div>

                            <div
                              className={`flex items-center px-3 ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.hireDate }}
                            >
                              <span
                                className="text-sm text-foreground/80"
                                style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              >
                                {agent.derniereDateFormation}
                              </span>
                            </div>

                            <div
                              className={`flex items-center px-3 ${
                                mounted
                                  ? isDark
                                    ? "border-l border-zinc-600"
                                    : "border-l border-zinc-200"
                                  : "border-l-2 border-border"
                              }`}
                              style={{ width: columnWidths.status }}
                            >
                              {(() => {
                                const { bgColor, textColor, dotColor } = getStatusColor(agent.categorie)
                                return (
                                  <div
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap ${bgColor} ${textColor} rounded-md`}
                                    style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                                    {agent.categorie}
                                  </div>
                                )
                              })()}
                            </div>

                            <div
                              className="flex mr-3 items-center justify-center"
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
                                    onClick={() => handleEditClick(agent)}
                                    disabled={!selectedAgents.includes(agent.id)}
                                  >
                                    <SquarePen size={14} />
                                    <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                      تعـديــل بيــانــــات
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    dir="rtl"
                                    className="gap-2 cursor-pointer"
                                    onClick={() => {
                                      if (selectedAgents.includes(agent.id)) {
                                        // Preserve current URL params
                                        const params = new URLSearchParams(searchParams?.toString())
                                        const returnUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
                                        router.push(`/formation-agent?agentId=${agent.id}&returnUrl=${encodeURIComponent(returnUrl)}`)
                                      }
                                    }}
                                    disabled={!selectedAgents.includes(agent.id)}
                                  >
                                    <GraduationCap size={14} />
                                    <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                      قــائمــة التـربصـات
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    dir="rtl"
                                    className="gap-2 cursor-pointer"
                                    onClick={() => handleAddFormationClick(agent)}
                                    disabled={!selectedAgents.includes(agent.id)}
                                  >
                                    <CirclePlus size={14} />
                                    <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                      إضــافــة تكــويــــن
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    dir="rtl"
                                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={() => handleDeleteClick(agent)}
                                    disabled={!selectedAgents.includes(agent.id)}
                                  >
                                    <Trash2 size={14} />
                                    <span style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
                                      حــــــــــــــــذف
                                    </span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <AnimatePresence mode="wait">
                                {editingAgent?.id === agent.id && (
                                  <DialogueStyle
                                    agent={editingAgent}
                                    isOpen={true}
                                    onClose={handleCancelEdit}
                                    onSave={async (data) => {
                                      // Validation
                                      if (!data.nomPrenom.trim()) {
                                        addToast({
                                          variant: "warning",
                                          title: "تحذير",
                                          description: "الرجاء إدخال الإسم و اللقب",
                                        })
                                        return
                                      }
                                      if (!data.grade.trim()) {
                                        addToast({
                                          variant: "warning",
                                          title: "تحذير",
                                          description: "الرجاء اختيار الرتبة",
                                        })
                                        return
                                      }
                                      if (!data.matricule.trim()) {
                                        addToast({
                                          variant: "warning",
                                          title: "تحذير",
                                          description: "الرجاء إدخال الرقم",
                                        })
                                        return
                                      }
                                      if (!data.telephone || data.telephone === 0) {
                                        addToast({
                                          variant: "warning",
                                          title: "تحذير",
                                          description: "الرجاء إدخال رقم الهاتف",
                                        })
                                        return
                                      }

                                      if (onSaveEdit) {
                                        const result = await onSaveEdit({
                                          ...data,
                                          nomPrenom: data.nomPrenom.trim(),
                                          responsabilite: data.responsabilite.trim(),
                                          derniereDateFormation: editingAgent.derniereDateFormation,
                                          categorie: editingAgent.categorie,
                                          avatar: editingAgent.avatar,
                                        })

                                        if (result.success) {
                                          addToast({
                                            variant: "success",
                                            title: "نجح",
                                            description: "تم تحديث البيانات بنجاح",
                                          })
                                          handleCancelEdit()
                                        } else {
                                          addToast({
                                            variant: "error",
                                            title: "خطأ",
                                            description: "حدث خطأ أثناء تحديث البيانات",
                                          })
                                        }
                                      }
                                    }}
                                    isUpdating={isUpdating}
                                  />
                                )}
                              </AnimatePresence>

                              <AnimatePresence mode="wait">
                                {addingFormationAgent?.id === agent.id && (
                                  <DialogueAgentFormation
                                    agent={addingFormationAgent}
                                    formations={availableFormations}
                                    formationData={formationFormData}
                                    isOpen={true}
                                    onClose={handleCancelFormation}
                                    onChange={handleFormationFormChange}
                                    onSave={handleSaveFormation}
                                    isUpdating={isSavingFormation}
                                    isLoadingFormations={isLoadingFormations}
                                    error={formationError || undefined}
                                  />
                                )}
                              </AnimatePresence>
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

      {sortedAndFilteredAgents.length > 0 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
            الصفحــة {currentPage} مــن {totalPages} - ({sortedAndFilteredAgents.length}{" "}
            {sortedAndFilteredAgents.length < 11 ? "متربصين" : "متـربـص"})
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              التالي
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
              تأكيــد الحـــذف
            </AlertDialogTitle>
            <AlertDialogDescription
              className="py-5 text-start"
              dir="rtl"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              هل أنت متأكد من حذف هذا المتربص؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
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

// Wrapper component that provides toast context
export function ResizableTableWithToast(props: ResizableTableProps) {
  return (
    <ToastProvider>
      <ResizableTable {...props} />
    </ToastProvider>
  )
}
