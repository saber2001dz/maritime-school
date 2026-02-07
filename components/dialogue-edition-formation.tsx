"use client"

import { useId, useState, useEffect, useMemo, useCallback } from "react"
import { XIcon, Trash2, Search, GraduationCap, Calendar } from "lucide-react"
import localFont from "next/font/local"
import { AnimatePresence, motion } from "framer-motion"
import useDebounce from "@/hooks/use-debounce"
import { getSelectableResultatOptions } from "@/lib/resultat-utils"

import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const notoNaskhArabic = localFont({
  src: "../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

// Image de fond pour le profil
const initialBgImage = [
  {
    name: "nautique.png",
    size: 1528737,
    type: "image/png",
    url: "/images/nautique.png",
    id: "nautique-bg-123456789",
  },
]

const initialAvatarImage = [
  {
    name: "Logo2.png",
    size: 1528737,
    type: "image/png",
    url: "/images/Logo2.png",
    id: "logo2-avatar-123456789",
  },
]

export interface SessionFormationOption {
  id: string
  formationId: string
  dateDebut: string
  dateFin: string
  reference?: string | null
  isAlreadyEnrolled?: boolean
  formation: {
    id: string
    formation: string
    typeFormation: string
  }
}

export interface AgentFormationData {
  sessionFormationId: string
  dateDebut: string
  dateFin: string
  reference: string
  resultat: string
  moyenne: number
}

interface Agent {
  id: string
  nomPrenom: string
  grade: string
  matricule: string
}

interface DialogueEditionFormationProps {
  agent?: Agent
  sessionFormations?: SessionFormationOption[]
  formationData?: AgentFormationData | null
  agentFormationId?: string
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: AgentFormationData) => void
  onDelete?: (id: string) => void
  onChange?: (field: string, value: string | number) => void
  isUpdating?: boolean
  isDeleting?: boolean
  isLoadingFormations?: boolean
}

// Animation variants for the search results
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  },
} as const

export default function DialogueEditionFormation({
  agent,
  sessionFormations = [],
  formationData,
  agentFormationId,
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  onDelete,
  onChange,
  isUpdating = false,
  isDeleting = false,
  isLoadingFormations = false,
}: DialogueEditionFormationProps = {}) {
  const id = useId()

  // Utiliser les données contrôlées si disponibles, sinon utiliser l'état interne
  const [internalSessionFormationId, setInternalSessionFormationId] = useState("")
  const [internalDateDebut, setInternalDateDebut] = useState("")
  const [internalDateFin, setInternalDateFin] = useState("")
  const [internalReference, setInternalReference] = useState("")
  const [internalResultat, setInternalResultat] = useState("")
  const [internalMoyenne, setInternalMoyenne] = useState(0)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Utiliser les données contrôlées ou l'état interne
  const sessionFormationId = formationData?.sessionFormationId ?? internalSessionFormationId
  const dateDebut = formationData?.dateDebut ?? internalDateDebut
  const dateFin = formationData?.dateFin ?? internalDateFin
  const reference = formationData?.reference ?? internalReference
  const resultat = formationData?.resultat ?? internalResultat
  const moyenne = formationData?.moyenne ?? internalMoyenne

  // Vérifier si la session de formation est terminée (date de fin dépassée)
  // La session est considérée comme terminée APRÈS la date de fin (le lendemain)
  const isSessionTerminee = (() => {
    if (!dateFin) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(dateFin)
    endDate.setHours(23, 59, 59, 999) // Fin de journée de la date de fin
    return today > endDate
  })()

  // Vérifier si la session est en cours (entre dateDebut et dateFin)
  const isSessionEnCours = (() => {
    if (!dateDebut || !dateFin) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(dateDebut)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(dateFin)
    endDate.setHours(0, 0, 0, 0)
    return today >= startDate && today < endDate
  })()

  // Initialiser les champs avec les données existantes quand le dialogue s'ouvre
  useEffect(() => {
    if (isOpen && formationData) {
      setInternalSessionFormationId(formationData.sessionFormationId)
      setInternalDateDebut(formationData.dateDebut)
      setInternalDateFin(formationData.dateFin)
      setInternalReference(formationData.reference)
      setInternalResultat(formationData.resultat)
      setInternalMoyenne(formationData.moyenne)
    } else if (isOpen && !formationData) {
      // Réinitialiser si pas de données
      setInternalSessionFormationId("")
      setInternalDateDebut("")
      setInternalDateFin("")
      setInternalReference("")
      setInternalResultat("")
      setInternalMoyenne(0)
    }
  }, [isOpen, formationData])

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    if (onChange) {
      onChange(field, value)
    } else {
      // Mode non contrôlé - mettre à jour l'état interne
      switch (field) {
        case "sessionFormationId":
          setInternalSessionFormationId(value as string)
          // Auto-remplir les champs lors de la sélection d'une session
          const selectedSession = sessionFormations.find(s => s.id === value)
          if (selectedSession) {
            setInternalDateDebut(formatDateForInput(selectedSession.dateDebut))
            setInternalDateFin(formatDateForInput(selectedSession.dateFin))
            setInternalReference(selectedSession.reference || "")
          }
          break
        case "resultat":
          setInternalResultat(value as string)
          break
        case "moyenne":
          setInternalMoyenne(value as number)
          break
      }
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        sessionFormationId,
        dateDebut,
        dateFin,
        reference,
        resultat,
        moyenne,
      })
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete && agentFormationId) {
      onDelete(agentFormationId)
    }
    setDeleteDialogOpen(false)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
  }

  // Le dialogue en mode autonome (sans agent) nécessite son propre AnimatePresence
  const dialogContent = (
    <Dialog open={true} modal={true}>
      <DialogContent
        className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg bg-white dark:bg-slate-900 [&>button:last-child]:top-3.5"
        showClose={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="contents space-y-0">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <DialogTitle className={`text-start font-bold text-md ${notoNaskhArabic.className}`}>
              {agent ? (
                <>
                  <span className="text-[#1071c7]">تعديل تكوين الموظف: </span>
                  <span className="text-foreground/60 dark:text-foreground/50">ال{agent.grade} {agent.nomPrenom}</span>
                </>
              ) : (
                <span className="text-[#1071c7]">تعديل تكوين الموظف</span>
              )}
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {agent ? `تعديل تكوين الموظف: ال${agent.grade} ${agent.nomPrenom}` : "تعديل تكوين الموظف"}
        </DialogDescription>

        <div className="overflow-y-auto">
          <ProfileBg />
          <Avatar />
          <div className="px-6 pt-4 pb-6">
            <form className="space-y-4">
              {/* Search Bar for Session Formations */}
              <SessionFormationSearchBar
                sessionFormations={sessionFormations}
                isLoadingFormations={isLoadingFormations}
                onSelect={(selectedSessionId) => handleChange("sessionFormationId", selectedSessionId)}
                selectedId={sessionFormationId}
                currentSessionFormationId={sessionFormationId}
              />

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-date-debut`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    تاريخ بداية التكوين :
                  </Label>
                  <Input
                    id={`${id}-date-debut`}
                    type="text"
                    value={dateDebut ? formatDateForSelect(dateDebut) : ""}
                    readOnly
                    disabled
                    className="text-right bg-muted cursor-not-allowed"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-date-fin`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    تاريخ نهاية التكوين :
                  </Label>
                  <Input
                    id={`${id}-date-fin`}
                    type="text"
                    value={dateFin ? formatDateForSelect(dateFin) : ""}
                    readOnly
                    disabled
                    className="text-right bg-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-reference`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  المرجع :
                </Label>
                <Input
                  id={`${id}-reference`}
                  type="text"
                  value={reference}
                  readOnly
                  disabled
                  className={`text-right bg-muted cursor-not-allowed ${notoNaskhArabic.className}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-resultat`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  الــوضـعـيـــة :
                </Label>
                <Select
                  dir="rtl"
                  value={resultat || undefined}
                  onValueChange={(value) => handleChange("resultat", value)}
                >
                  <SelectTrigger className={`w-full rounded ${notoNaskhArabic.className}`}>
                    <SelectValue placeholder="اختر النتيجة" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {getSelectableResultatOptions().map((option) => {
                      const isDisabled =
                        ((option.variant === "success" || option.variant === "interrupted") && !isSessionTerminee) ||
                        (option.variant === "inProgress" && !isSessionEnCours)

                      const showMessage = sessionFormationId && (
                        ((option.variant === "success" || option.variant === "interrupted") && !isSessionTerminee) ||
                        (option.variant === "inProgress" && !isSessionEnCours)
                      )

                      return (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-[15px]"
                          disabled={isDisabled}
                        >
                          {option.label} {showMessage && "(التكوين لم ينتهِ بعد)"}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-moyenne`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  المعدل (0-20) :
                  {!isSessionTerminee && sessionFormationId && (
                    <span className="text-xs text-muted-foreground mr-2">(التكوين لم ينتهِ بعد)</span>
                  )}
                </Label>
                <Input
                  id={`${id}-moyenne`}
                  type="number"
                  min="0"
                  max="20"
                  step="0.01"
                  placeholder="0.00"
                  value={moyenne}
                  onChange={(e) => handleChange("moyenne", parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  disabled={!isSessionTerminee && !!sessionFormationId}
                  className={`text-right placeholder:text-muted-foreground/50 ${
                    !isSessionTerminee && sessionFormationId ? "bg-muted cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4 flex-row sm:justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-9 w-9 p-0 cursor-pointer hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDeleteClick}
                disabled={isUpdating || isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className={notoNaskhArabic.className}>حذف الدورة التكوينية</span>
            </TooltipContent>
          </Tooltip>

          <div className="flex flex-1 justify-end gap-2">
            <Button
              className={`text-sm cursor-pointer ${notoNaskhArabic.className}`}
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating || isDeleting}
            >
              إلـغــاء
            </Button>
            <Button
              className={`text-sm cursor-pointer bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-700 text-white ${notoNaskhArabic.className}`}
              type="button"
              onClick={handleSave}
              disabled={isUpdating || isDeleting}
            >
              {isUpdating ? "جاري الحفظ..." : "سـجـل البيــانــات"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      {/* Si pas d'agent (mode autonome), wrapper avec AnimatePresence */}
      {!agent ? (
        <AnimatePresence mode="wait">{isOpen && dialogContent}</AnimatePresence>
      ) : (
        /* Si agent fourni (mode contrôlé), pas de AnimatePresence ici car il est dans le parent */
        isOpen && dialogContent
      )}

      {/* AlertDialog pour la confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }} className="text-start">
              تأكيــد الحـــذف
            </AlertDialogTitle>
            <AlertDialogDescription className={`py-5 text-start ${notoNaskhArabic.className}`}>
              هل أنت متأكد من حذف هذه الدورة التكوينية؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end cursor-pointer">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className={`cursor-pointer ${notoNaskhArabic.className}`}
              disabled={isDeleting}
            >
              إلغــاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className={`bg-red-600 hover:bg-red-700 text-white cursor-pointer ${notoNaskhArabic.className}`}
              disabled={isDeleting}
            >
              {isDeleting ? "جاري الحذف..." : "حــــــذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Fonction utilitaire pour formater une date ISO en YYYY-MM-DD
function formatDateForInput(isoDate: string): string {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  return date.toISOString().split("T")[0]
}

// Fonction utilitaire pour formater une date pour le select (YYYY-MM-DD)
function formatDateForSelect(isoDate: string): string {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

// Session Formation Search Bar Component
interface SessionFormationSearchBarProps {
  sessionFormations: SessionFormationOption[]
  isLoadingFormations: boolean
  onSelect: (sessionId: string) => void
  selectedId: string
  hasError?: boolean
  currentSessionFormationId?: string
}

function SessionFormationSearchBar({
  sessionFormations,
  isLoadingFormations,
  onSelect,
  selectedId,
  hasError = false,
  currentSessionFormationId,
}: SessionFormationSearchBarProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 200)

  // Initialize query with selected session formation name
  useEffect(() => {
    if (selectedId && !isFocused) {
      const selected = sessionFormations.find((s) => s.id === selectedId)
      if (selected) {
        setQuery(selected.formation.formation)
      }
    }
  }, [selectedId, sessionFormations, isFocused])

  const filteredSessions = useMemo(() => {
    if (!debouncedQuery) return sessionFormations
    const normalizedQuery = debouncedQuery.toLowerCase().trim()
    return sessionFormations.filter((session) => {
      const searchableText = `${session.formation.formation} ${session.formation.typeFormation} ${session.reference || ""}`.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [debouncedQuery, sessionFormations])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setActiveIndex(-1)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!filteredSessions.length) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev < filteredSessions.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredSessions.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (activeIndex >= 0 && filteredSessions[activeIndex]) {
            const selected = filteredSessions[activeIndex]
            onSelect(selected.id)
            setQuery(selected.formation.formation)
            setIsFocused(false)
          }
          break
        case "Escape":
          setIsFocused(false)
          setActiveIndex(-1)
          break
      }
    },
    [filteredSessions, activeIndex, onSelect]
  )

  const handleSessionClick = useCallback(
    (sessionId: string, formationName: string, isEnrolled?: boolean) => {
      // Empêcher la sélection si déjà inscrit
      if (isEnrolled) {
        return
      }
      onSelect(sessionId)
      setQuery(formationName)
      setIsFocused(false)
    },
    [onSelect]
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    setActiveIndex(-1)
    e.target.select()
  }, [])

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false)
      setActiveIndex(-1)
    }, 200)
  }, [])

  return (
    <div className="space-y-2">
      <Label className={`text-sm font-light ${notoNaskhArabic.className}`}>الدورة التكوينية :</Label>
      <div className="relative">
        <Input
          type="text"
          placeholder={isLoadingFormations ? "جاري التحميل..." : "ابحث عن الدورة التكوينية..."}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isLoadingFormations}
          dir="rtl"
          className={`pr-3 pl-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0 ${notoNaskhArabic.className} ${
            hasError ? "border-red-500 focus:ring-red-500" : ""
          }`}
          role="combobox"
          aria-expanded={isFocused && filteredSessions.length > 0}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4">
          <AnimatePresence mode="popLayout">
            <motion.div
              key="search"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {isFocused && filteredSessions.length > 0 && (
            <motion.div
              key={`search-results-${debouncedQuery}-${filteredSessions.length}`}
              className="absolute z-50 w-full border rounded-md shadow-lg overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1 max-h-48 overflow-y-auto"
              variants={ANIMATION_VARIANTS.container}
              role="listbox"
              aria-label="نتائج البحث"
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul role="none">
                {filteredSessions.map((session, index) => {
                  const isCurrentSession = session.id === currentSessionFormationId
                  const isEnrolled = session.isAlreadyEnrolled && !isCurrentSession
                  return (
                    <motion.li
                      key={session.id}
                      id={`session-${session.id}`}
                      className={`px-3 py-2 flex items-center justify-between ${
                        isEnrolled
                          ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-zinc-900/50"
                          : "hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer"
                      } ${
                        activeIndex === index && !isEnrolled ? "bg-gray-100 dark:bg-zinc-800" : ""
                      } ${selectedId === session.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      variants={ANIMATION_VARIANTS.item}
                      layout
                      onClick={() => handleSessionClick(session.id, session.formation.formation, isEnrolled)}
                      role="option"
                      aria-selected={activeIndex === index}
                      aria-disabled={isEnrolled}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-gray-500" aria-hidden="true">
                          <GraduationCap className={`h-4 w-4 ${isEnrolled ? "text-gray-400" : "text-blue-500"}`} />
                        </span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isEnrolled ? "text-gray-500 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"} truncate ${notoNaskhArabic.className}`}>
                              {session.formation.formation}
                            </span>
                            {isCurrentSession && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap ${notoNaskhArabic.className}`}>
                                الدورة الحالية
                              </span>
                            )}
                            {isEnrolled && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 whitespace-nowrap ${notoNaskhArabic.className}`}>
                                متربص مسجل
                              </span>
                            )}
                          </div>
                          <span className={`text-xs ${isEnrolled ? "text-gray-400 dark:text-gray-600" : "text-gray-400"} ${notoNaskhArabic.className}`}>
                            {session.formation.typeFormation}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mr-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDateForSelect(session.dateDebut)} - {formatDateForSelect(session.dateFin)}
                        </span>
                      </div>
                    </motion.li>
                  )
                })}
              </motion.ul>
              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                <div className={`flex items-center justify-between text-xs text-gray-500 ${notoNaskhArabic.className}`}>
                  <span>↑↓ للتنقل</span>
                  <span>ESC للإلغاء</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProfileBg() {
  const [{ files }] = useFileUpload({
    accept: "image/*",
    initialFiles: initialBgImage,
  })

  const currentImage = files[0]?.preview || null

  return (
    <div className="h-32">
      <div className="relative flex size-full items-center justify-center overflow-hidden bg-muted">
        {currentImage && (
          <img
            className="size-full object-cover"
            src={currentImage}
            alt={files[0]?.preview ? "Preview of uploaded image" : "Default profile background"}
            width={512}
            height={96}
          />
        )}
      </div>
    </div>
  )
}

function Avatar() {
  const [{ files }] = useFileUpload({
    accept: "image/*",
    initialFiles: initialAvatarImage,
  })

  const currentImage = files[0]?.preview || null

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-xs shadow-black/10">
        {currentImage && (
          <img src={currentImage} className="size-full object-cover" width={80} height={80} alt="Profile image" />
        )}
      </div>
    </div>
  )
}
