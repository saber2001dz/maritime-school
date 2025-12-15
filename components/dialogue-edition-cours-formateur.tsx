"use client"

import { useId, useState, useEffect, useMemo, useCallback } from "react"
import { XIcon, Trash2, Search, Send, BookOpen, Check } from "lucide-react"
import localFont from "next/font/local"
import { AnimatePresence, motion } from "framer-motion"

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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import useDebounce from "@/hooks/use-debounce"

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
    name: "formateur.png",
    size: 1528737,
    type: "image/png",
    url: "/images/formateur.png",
    id: "formateur-avatar-123456789",
  },
]

export interface Cours {
  id: string
  titre: string
}

export interface CoursFormateurData {
  coursId: string
  dateDebut: string
  dateFin: string
  nombreHeures: number
  reference?: string
}

interface Formateur {
  id: string
  nomPrenom: string
  grade: string
}

interface DialogueEditionCoursFormateurProps {
  formateur?: Formateur
  coursList?: Cours[]
  coursData?: CoursFormateurData | null
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: CoursFormateurData) => void
  onDelete?: (coursFormateurId: string) => void
  onChange?: (field: string, value: string | number) => void
  isUpdating?: boolean
  isDeleting?: boolean
  isLoadingCours?: boolean
  error?: string
}

export default function DialogueEditionCoursFormateur({
  formateur,
  coursList = [],
  coursData,
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  onDelete,
  onChange,
  isUpdating = false,
  isDeleting = false,
  isLoadingCours = false,
  error,
}: DialogueEditionCoursFormateurProps = {}) {
  const id = useId()

  // Utiliser les données contrôlées si disponibles, sinon utiliser l'état interne
  const [internalCoursId, setInternalCoursId] = useState("")
  const [internalDateDebut, setInternalDateDebut] = useState("")
  const [internalDateFin, setInternalDateFin] = useState("")
  const [internalNombreHeures, setInternalNombreHeures] = useState(0)
  const [internalReference, setInternalReference] = useState("")
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [dateError, setDateError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Utiliser les données contrôlées ou l'état interne
  const coursId = coursData?.coursId ?? internalCoursId
  const dateDebut = coursData?.dateDebut ?? internalDateDebut
  const dateFin = coursData?.dateFin ?? internalDateFin
  const nombreHeures = coursData?.nombreHeures ?? internalNombreHeures
  const reference = coursData?.reference ?? internalReference

  // Initialiser les champs avec les données existantes quand le dialogue s'ouvre
  useEffect(() => {
    if (isOpen && coursData) {
      setInternalCoursId(coursData.coursId)
      setInternalDateDebut(coursData.dateDebut)
      setInternalDateFin(coursData.dateFin)
      setInternalNombreHeures(coursData.nombreHeures)
      setInternalReference(coursData.reference || "")
      setDateError("")
    } else if (isOpen && !coursData) {
      // Réinitialiser si pas de données
      setInternalCoursId("")
      setInternalDateDebut("")
      setInternalDateFin("")
      setInternalNombreHeures(0)
      setInternalReference("")
      setDateError("")
    }
  }, [isOpen, coursData])

  // Valider la date de fin quand elle change ou quand la date de début change
  const validateDateFin = (dateDebutValue: string, dateFinValue: string) => {
    if (dateDebutValue && dateFinValue && dateFinValue < dateDebutValue) {
      setDateError("* تاريخ نهاية الدرس غير صحيح")
    } else {
      setDateError("")
    }
  }

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
        case "coursId":
          setInternalCoursId(value as string)
          break
        case "dateDebut":
          setInternalDateDebut(value as string)
          // Valider la date de fin quand la date de début change
          validateDateFin(value as string, dateFin)
          break
        case "dateFin":
          setInternalDateFin(value as string)
          break
        case "nombreHeures":
          setInternalNombreHeures(value as number)
          break
        case "reference":
          setInternalReference(value as string)
          break
      }
    }
  }

  const handleDateFinBlur = () => {
    validateDateFin(dateDebut, dateFin)
  }

  const handleSave = () => {
    // Valider la date avant l'enregistrement
    validateDateFin(dateDebut, dateFin)

    // Ne pas enregistrer si la date est invalide
    if (dateDebut && dateFin && dateFin < dateDebut) {
      return
    }

    if (onSave) {
      onSave({
        coursId,
        dateDebut,
        dateFin,
        nombreHeures,
        reference: reference || undefined,
      })
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete && coursData) {
      onDelete(coursData.coursId)
    }
    setDeleteDialogOpen(false)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
  }

  // Le dialogue en mode autonome (sans formateur) nécessite son propre AnimatePresence
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
              {formateur ? (
                <>
                  <span className="text-[#1071c7]">تعديل درس للمــدرس: </span>
                  <span className="text-foreground/60 dark:text-foreground/50">ال{formateur.grade} {formateur.nomPrenom}</span>
                </>
              ) : (
                <span className="text-[#1071c7]">تعديل درس للمــدرس</span>
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
          {formateur ? `تعديل درس المدرس: ال${formateur.grade} ${formateur.nomPrenom}` : "تعديل درس المدرس"}
        </DialogDescription>

        <div className="overflow-y-auto">
          <ProfileBg />
          <Avatar />
          <div className="px-6 pt-4 pb-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-cours`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  الــــــدرس :
                </Label>
                <CoursSearchBar
                  coursList={coursList}
                  selectedCoursId={coursId}
                  onCoursSelect={(id) => handleChange("coursId", id)}
                  isLoading={isLoadingCours}
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-date-debut`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    تاريخ بداية الدرس :
                  </Label>
                  <Input
                    id={`${id}-date-debut`}
                    type="date"
                    value={dateDebut}
                    onChange={(e) => handleChange("dateDebut", e.target.value)}
                    required
                    className="text-start"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-date-fin`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    تاريخ نهاية الدرس :
                  </Label>
                  <Input
                    id={`${id}-date-fin`}
                    type="date"
                    value={dateFin}
                    onChange={(e) => handleChange("dateFin", e.target.value)}
                    onBlur={handleDateFinBlur}
                    required
                    className={`text-start ${dateError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {dateError && (
                    <p className={`text-xs text-red-500 leading-tight -mb-6 ${notoNaskhArabic.className}`}>
                      {dateError}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-nombre-heures`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  عدد الساعات :
                </Label>
                <Input
                  id={`${id}-nombre-heures`}
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={nombreHeures}
                  onChange={(e) => handleChange("nombreHeures", parseFloat(e.target.value) || 0)}
                  className="text-right placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-reference`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  المــرجــــــــع :
                </Label>
                <Input
                  id={`${id}-reference`}
                  type="text"
                  dir="rtl"
                  placeholder="أدخل المرجع"
                  value={reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  className={`text-right placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className={`text-sm text-red-600 dark:text-red-400 text-center ${notoNaskhArabic.className}`}>
                    {error}
                  </p>
                </div>
              )}
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
              <span className={notoNaskhArabic.className}>حذف الدرس</span>
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
      {/* Si pas de formateur (mode autonome), wrapper avec AnimatePresence */}
      {!formateur ? (
        <AnimatePresence mode="wait">{isOpen && dialogContent}</AnimatePresence>
      ) : (
        /* Si formateur fourni (mode contrôlé), pas de AnimatePresence ici car il est dans le parent */
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
              هل أنت متأكد من حذف هذا الدرس للمدرس؟ هذا الإجراء لا يمكن التراجع عنه.
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

// Animation variants for the search bar
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.06,
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

interface CoursSearchBarProps {
  coursList: Cours[]
  selectedCoursId: string
  onCoursSelect: (coursId: string) => void
  isLoading?: boolean
  hasError?: boolean
}

function CoursSearchBar({
  coursList,
  selectedCoursId,
  onCoursSelect,
  isLoading = false,
  hasError = false,
}: CoursSearchBarProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 200)

  // Initialize query with selected course name
  useEffect(() => {
    if (selectedCoursId && !isFocused) {
      const selected = coursList.find((c) => c.id === selectedCoursId)
      if (selected) {
        setQuery(selected.titre)
      }
    }
  }, [selectedCoursId, coursList, isFocused])

  // Filter courses based on search
  const filteredCours = useMemo(() => {
    if (!debouncedQuery) return coursList
    const normalizedQuery = debouncedQuery.toLowerCase().trim()
    return coursList.filter((cours) => cours.titre.toLowerCase().includes(normalizedQuery))
  }, [debouncedQuery, coursList])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setActiveIndex(-1)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!filteredCours.length) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev < filteredCours.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredCours.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (activeIndex >= 0 && filteredCours[activeIndex]) {
            const selected = filteredCours[activeIndex]
            onCoursSelect(selected.id)
            setQuery(selected.titre)
            setIsFocused(false)
          }
          break
        case "Escape":
          setIsFocused(false)
          setActiveIndex(-1)
          break
      }
    },
    [filteredCours, activeIndex, onCoursSelect]
  )

  const handleCoursClick = useCallback(
    (coursId: string, coursTitre: string) => {
      onCoursSelect(coursId)
      setQuery(coursTitre)
      setIsFocused(false)
    },
    [onCoursSelect]
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    setActiveIndex(-1)
    // Select all text when focused
    e.target.select()
  }, [])

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false)
      setActiveIndex(-1)
    }, 200)
  }, [])

  return (
    <div className="w-full">
      <div className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder={isLoading ? "جاري التحميل..." : "ابحث عن الدرس..."}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            role="combobox"
            aria-expanded={isFocused && filteredCours.length > 0}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `cours-${filteredCours[activeIndex]?.id}` : undefined}
            autoComplete="off"
            dir="rtl"
            className={`pr-3 pl-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0 ${notoNaskhArabic.className} ${
              hasError ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4">
            <AnimatePresence mode="popLayout">
              {query.length > 0 ? (
                <motion.div
                  key="send"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isFocused && !isLoading && filteredCours.length > 0 && (
            <motion.div
              key={`search-results-${debouncedQuery}-${filteredCours.length}`}
              className="absolute w-full border rounded-md shadow-lg overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1 z-50 max-h-48 overflow-y-auto"
              variants={ANIMATION_VARIANTS.container}
              role="listbox"
              aria-label="قائمة الدروس"
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul role="none">
                {filteredCours.map((cours, index) => (
                  <motion.li
                    key={cours.id}
                    id={`cours-${cours.id}`}
                    className={`px-3 py-2 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md ${
                      activeIndex === index ? "bg-gray-100 dark:bg-zinc-800" : ""
                    } ${selectedCoursId === cours.id ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                    variants={ANIMATION_VARIANTS.item}
                    layout
                    onClick={() => handleCoursClick(cours.id, cours.titre)}
                    role="option"
                    aria-selected={activeIndex === index}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500" aria-hidden="true">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                      </span>
                      <span className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${notoNaskhArabic.className}`}>
                        {cours.titre}
                      </span>
                    </div>
                    {selectedCoursId === cours.id && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </motion.li>
                ))}
              </motion.ul>
              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
                <div className={`flex items-center justify-between text-xs text-gray-500 ${notoNaskhArabic.className}`}>
                  <span>استخدم ↑↓ للتنقل</span>
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
