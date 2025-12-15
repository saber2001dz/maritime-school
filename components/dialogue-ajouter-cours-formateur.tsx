"use client"

import { useId, useState, useEffect, useMemo, useCallback } from "react"
import { XIcon, Search, Send, BookOpen, Check } from "lucide-react"
import localFont from "next/font/local"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"

import { useFileUpload } from "@/hooks/use-file-upload"
import { useToast } from "@/components/ui/ultra-quality-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import useDebounce from "@/hooks/use-debounce"

const notoNaskhArabic = localFont({
  src: "../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

// Image de fond pour le profil
const initialBgImage = [
  {
    name: "formateur.png",
    size: 1528737,
    type: "image/png",
    url: "/images/formateur.png",
    id: "formateur-bg-123456789",
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

interface DialogueAjouterCoursFormateurProps {
  formateur?: Formateur
  coursList?: Cours[]
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: CoursFormateurData) => void
  isCreating?: boolean
  isLoadingCours?: boolean
  error?: string
}

export default function DialogueAjouterCoursFormateur({
  formateur,
  coursList = [],
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  isCreating = false,
  isLoadingCours = false,
  error,
}: DialogueAjouterCoursFormateurProps = {}) {
  const id = useId()
  const { addToast } = useToast()

  const [coursId, setCoursId] = useState("")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [nombreHeures, setNombreHeures] = useState(0)
  const [reference, setReference] = useState("")
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [dateError, setDateError] = useState("")
  const [invalidDateField, setInvalidDateField] = useState<"debut" | "fin" | null>(null)
  const [coursError, setCoursError] = useState(false)
  const [nombreHeuresError, setNombreHeuresError] = useState(false)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Réinitialiser les champs quand le dialogue s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCoursId("")
      setDateDebut("")
      setDateFin("")
      setNombreHeures(0)
      setReference("")
      setDateError("")
      setInvalidDateField(null)
      setCoursError(false)
      setNombreHeuresError(false)
    }
  }, [isOpen])

  // Valider l'année (doit être entre 1950 et 2050)
  const validateYear = (dateValue: string, field: "debut" | "fin", showAlert: boolean = false): boolean => {
    if (!dateValue) {
      return true
    }
    const year = parseInt(dateValue.split("-")[0])
    if (year < 1950 || year > 2050) {
      if (showAlert) {
        setInvalidDateField(field)
        addToast({
          title: "خطأ في التاريخ",
          description: "السنة يجب أن تكون بين 1950 و 2050",
          variant: "error",
          duration: 4000,
        })
      }
      return false
    }
    return true
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  const handleDateDebutChange = (value: string) => {
    setDateDebut(value)
    setInvalidDateField(null)
    // Valider uniquement la relation entre dates (sans bordure rouge ni alerte)
    if (value && dateFin && dateFin < value) {
      setDateError("* تاريخ نهاية الدرس غير صحيح")
    } else {
      setDateError("")
    }
  }

  const handleDateDebutBlur = () => {
    // Pas de validation visuelle au blur
  }

  const handleDateFinChange = (value: string) => {
    setDateFin(value)
    setInvalidDateField(null)
    // Valider uniquement la relation entre dates (sans bordure rouge ni alerte)
    if (dateDebut && value && value < dateDebut) {
      setDateError("* تاريخ نهاية الدرس غير صحيح")
    } else {
      setDateError("")
    }
  }

  const handleDateFinBlur = () => {
    // Pas de validation visuelle au blur
  }

  const handleSave = () => {
    // Réinitialiser les erreurs
    setDateError("")
    setCoursError(false)
    setNombreHeuresError(false)

    // Valider les champs requis
    let hasError = false

    if (!coursId) {
      setCoursError(true)
      addToast({
        title: "خطأ في إختيار الدرس",
        description: "يجب اختيار الدرس",
        variant: "error",
        duration: 4000,
      })
      hasError = true
    }

    if (nombreHeures <= 0) {
      setNombreHeuresError(true)
      addToast({
        title: "خطأ في عدد الساعات",
        description: "يجب إدخال عدد الساعات",
        variant: "error",
        duration: 4000,
      })
      hasError = true
    }

    // Valider les années individuellement si les dates sont présentes
    if (dateDebut && !validateYear(dateDebut, "debut", true)) {
      hasError = true
    }
    if (dateFin && !validateYear(dateFin, "fin", true)) {
      hasError = true
    }

    // Valider la relation entre date de début et date de fin (sans toast)
    if (dateDebut && dateFin && dateFin < dateDebut) {
      setDateError("* تاريخ نهاية الدرس غير صحيح")
      hasError = true
    }

    // Ne pas enregistrer s'il y a des erreurs
    if (hasError) {
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

  // Le dialogue en mode autonome (sans formateur) nécessite son propre AnimatePresence
  const dialogContent = (
    <Dialog open={true} modal={true}>
      <DialogContent
        className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg bg-white dark:bg-slate-900 [&>button:last-child]:top-3.5 sm:top-[46%]"
        showClose={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="contents space-y-0">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <DialogTitle className={`text-start font-bold text-md ${notoNaskhArabic.className}`}>
              {formateur ? (
                <>
                  <span className="text-[#1071c7]">إضــــــــافـــــة درس للمــدرس: </span>
                  <span className="text-foreground/60 dark:text-foreground/50">
                    ال{formateur.grade} {formateur.nomPrenom}
                  </span>
                </>
              ) : (
                <span className="text-[#1071c7]">إضــــــــافـــــة درس للمــدرس</span>
              )}
            </DialogTitle>
            <button onClick={handleClose} className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {formateur
            ? `إضــــــــافـــــة درس للمــدرس: ال${formateur.grade} ${formateur.nomPrenom}`
            : "إضــــــــافـــــة درس للمــدرس"}
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
                  onCoursSelect={(id) => {
                    setCoursId(id)
                    setCoursError(false)
                  }}
                  isLoading={isLoadingCours}
                  hasError={coursError}
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
                    onChange={(e) => handleDateDebutChange(e.target.value)}
                    onBlur={handleDateDebutBlur}
                    className={`text-start ${dateError || invalidDateField === "debut" ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                    onChange={(e) => handleDateFinChange(e.target.value)}
                    onBlur={handleDateFinBlur}
                    className={`text-start ${dateError || invalidDateField === "fin" ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                  onChange={(e) => {
                    setNombreHeures(parseFloat(e.target.value) || 0)
                    setNombreHeuresError(false)
                  }}
                  className={`text-right placeholder:text-muted-foreground/50 ${
                    nombreHeuresError ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
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
                  onChange={(e) => setReference(e.target.value)}
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

        <DialogFooter className="border-t px-6 py-4">
          <Button
            className={`text-sm cursor-pointer ${notoNaskhArabic.className}`}
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            إلـغــاء
          </Button>
          <Button
            className={`text-sm cursor-pointer bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-700 text-white ${notoNaskhArabic.className}`}
            type="button"
            onClick={handleSave}
            disabled={isCreating}
          >
            {isCreating ? "جاري الحفظ..." : "سـجـل البيــانــات"}
          </Button>
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
  const [isLoading, setIsLoading] = useState(true)
  const [{ files }] = useFileUpload({
    accept: "image/*",
    initialFiles: initialBgImage,
  })

  const currentImage = files[0]?.preview || null

  return (
    <div className="h-32">
      <div className="relative flex size-full items-center justify-center overflow-hidden bg-muted">
        {/* Spinner loader pendant le chargement */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Spinner className="size-8 text-muted-foreground" />
          </div>
        )}

        {currentImage && (
          <Image
            src={currentImage}
            alt={files[0]?.preview ? "Preview of uploaded image" : "Default profile background"}
            fill
            className="object-cover"
            priority
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  )
}

function Avatar() {
  const [isLoading, setIsLoading] = useState(true)
  const [{ files }] = useFileUpload({
    accept: "image/*",
    initialFiles: initialAvatarImage,
  })

  const currentImage = files[0]?.preview || null

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-xs shadow-black/10">
        {/* Spinner loader pendant le chargement */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-full">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        )}

        {currentImage && (
          <Image
            src={currentImage}
            alt="Profile image"
            fill
            className="object-cover"
            priority
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  )
}
