"use client"

import { useId, useState, useEffect } from "react"
import { XIcon } from "lucide-react"
import localFont from "next/font/local"
import { AnimatePresence } from "framer-motion"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  onChange?: (field: string, value: string | number) => void
  isUpdating?: boolean
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
  onChange,
  isUpdating = false,
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
                  <span className="text-[#1071c7]">تعديل درس المدرس: </span>
                  <span className="text-foreground/60 dark:text-foreground/50">ال{formateur.grade} {formateur.nomPrenom}</span>
                </>
              ) : (
                <span className="text-[#1071c7]">تعديل درس المدرس</span>
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
                  الدرس :
                </Label>
                <Select
                  dir="rtl"
                  value={coursId}
                  onValueChange={(value) => handleChange("coursId", value)}
                  disabled={isLoadingCours}
                >
                  <SelectTrigger className={`w-full rounded ${notoNaskhArabic.className}`}>
                    <SelectValue
                      placeholder={isLoadingCours ? "جاري التحميل..." : "اختر الدرس"}
                    />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {coursList.map((cours) => (
                      <SelectItem key={cours.id} value={cours.id} className="text-[15px]">
                        {cours.titre}
                      </SelectItem>
                    ))}
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

        <DialogFooter className="border-t px-6 py-4">
          <Button
            className={`text-sm cursor-pointer ${notoNaskhArabic.className}`}
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
          >
            إلـغــاء
          </Button>
          <Button
            className={`text-sm cursor-pointer bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-700 text-white ${notoNaskhArabic.className}`}
            type="button"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? "جاري الحفظ..." : "سـجـل البيــانــات"}
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
