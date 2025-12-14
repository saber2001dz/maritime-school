"use client"

import { useId, useState, useEffect } from "react"
import { XIcon } from "lucide-react"
import localFont from "next/font/local"
import { AnimatePresence } from "framer-motion"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

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
  const [searchCours, setSearchCours] = useState("")
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
      setSearchCours("")
      setInvalidDateField(null)
      setCoursError(false)
      setNombreHeuresError(false)
    }
  }, [isOpen])

  // Filtrer la liste des cours en fonction de la recherche
  const filteredCoursList = coursList.filter((cours) => cours.titre.toLowerCase().includes(searchCours.toLowerCase()))

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
                <Select
                  dir="rtl"
                  value={coursId}
                  onValueChange={(value) => {
                    setCoursId(value)
                    setCoursError(false)
                  }}
                  disabled={isLoadingCours}
                >
                  <SelectTrigger
                    className={`w-full rounded ${notoNaskhArabic.className} ${
                      coursError ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder={isLoadingCours ? "جاري التحميل..." : "اختر الدرس"} />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    <div className="px-2 py-1.5 sticky top-0 bg-background z-10 border-b">
                      <Input
                        placeholder="ابحث عن الدرس..."
                        value={searchCours}
                        onChange={(e) => setSearchCours(e.target.value)}
                        className={`h-8 text-sm ${notoNaskhArabic.className}`}
                        dir="rtl"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[420px] overflow-y-auto">
                      {filteredCoursList.length > 0 ? (
                        filteredCoursList.map((cours) => (
                          <SelectItem key={cours.id} value={cours.id} className="text-[15px]">
                            {cours.titre}
                          </SelectItem>
                        ))
                      ) : (
                        <div className={`py-6 text-center text-sm text-muted-foreground ${notoNaskhArabic.className}`}>
                          لا توجد نتائج
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
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
