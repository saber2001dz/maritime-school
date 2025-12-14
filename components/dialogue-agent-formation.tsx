"use client"

import { useId, useState, useEffect } from "react"
import { XIcon } from "lucide-react"
import localFont from "next/font/local"
import { AnimatePresence } from "framer-motion"

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
    name: "stagiaire.png",
    size: 1528737,
    type: "image/png",
    url: "/images/stagiaire.png",
    id: "stagiaire-bg-123456789",
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

export interface Formation {
  id: string
  formation: string
  typeFormation: string
  specialite?: string | null
  duree?: string | null
  capaciteAbsorption?: number | null
}

export interface AgentFormationData {
  formationId: string
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

interface DialogueAgentFormationProps {
  agent?: Agent
  formations?: Formation[]
  formationData?: AgentFormationData | null
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: AgentFormationData) => void
  onChange?: (field: string, value: string | number) => void
  isUpdating?: boolean
  isLoadingFormations?: boolean
  error?: string
}

export default function DialogueAgentFormation({
  agent,
  formations = [],
  formationData,
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  onChange,
  isUpdating = false,
  isLoadingFormations = false,
  error,
}: DialogueAgentFormationProps = {}) {
  const id = useId()
  const { addToast } = useToast()

  // Utiliser les données contrôlées si disponibles, sinon utiliser l'état interne
  const [internalFormationId, setInternalFormationId] = useState("")
  const [internalDateDebut, setInternalDateDebut] = useState("")
  const [internalDateFin, setInternalDateFin] = useState("")
  const [internalReference, setInternalReference] = useState("")
  const [internalResultat, setInternalResultat] = useState("")
  const [internalMoyenne, setInternalMoyenne] = useState(0)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [dateError, setDateError] = useState("")
  const [formationError, setFormationError] = useState(false)
  const [dateDebutError, setDateDebutError] = useState(false)
  const [dateFinError, setDateFinError] = useState(false)
  const [resultatError, setResultatError] = useState(false)
  const [invalidDateField, setInvalidDateField] = useState<"debut" | "fin" | null>(null)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Utiliser les données contrôlées ou l'état interne
  const formationId = formationData?.formationId ?? internalFormationId
  const dateDebut = formationData?.dateDebut ?? internalDateDebut
  const dateFin = formationData?.dateFin ?? internalDateFin
  const reference = formationData?.reference ?? internalReference
  const resultat = formationData?.resultat ?? internalResultat
  const moyenne = formationData?.moyenne ?? internalMoyenne

  // Réinitialiser les champs internes quand le dialogue s'ouvre en mode non contrôlé
  useEffect(() => {
    if (isOpen && !formationData) {
      setInternalFormationId("")
      setInternalDateDebut("")
      setInternalDateFin("")
      setInternalReference("")
      setInternalResultat("")
      setInternalMoyenne(0)
      setDateError("")
      setFormationError(false)
      setDateDebutError(false)
      setDateFinError(false)
      setResultatError(false)
      setInvalidDateField(null)
    }
  }, [isOpen, formationData])

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

  const handleChange = (field: string, value: string | number) => {
    // Réinitialiser les erreurs pour tous les modes (contrôlé et non contrôlé)
    switch (field) {
      case "formationId":
        setFormationError(false)
        break
      case "dateDebut":
        setDateDebutError(false)
        setInvalidDateField(null)
        break
      case "dateFin":
        setDateFinError(false)
        setInvalidDateField(null)
        break
      case "resultat":
        setResultatError(false)
        break
    }

    if (onChange) {
      onChange(field, value)
    } else {
      // Mode non contrôlé - mettre à jour l'état interne
      switch (field) {
        case "formationId":
          setInternalFormationId(value as string)
          break
        case "dateDebut":
          setInternalDateDebut(value as string)
          // Valider uniquement la relation entre dates (sans bordure rouge ni alerte)
          if (value && dateFin && dateFin < (value as string)) {
            setDateError("* تاريخ نهاية التكوين غير صحيح")
          } else {
            setDateError("")
          }
          break
        case "dateFin":
          setInternalDateFin(value as string)
          // Valider uniquement la relation entre dates (sans bordure rouge ni alerte)
          if (dateDebut && value && (value as string) < dateDebut) {
            setDateError("* تاريخ نهاية التكوين غير صحيح")
          } else {
            setDateError("")
          }
          break
        case "reference":
          setInternalReference(value as string)
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
    // Réinitialiser les erreurs
    setDateError("")
    setFormationError(false)
    setDateDebutError(false)
    setDateFinError(false)
    setResultatError(false)

    // Valider les champs requis
    let hasError = false

    if (!formationId) {
      setFormationError(true)
      addToast({
        title: "خطأ في الـدورة التكوينية",
        description: "يجب اختيار الدورة التكوينية",
        variant: "error",
        duration: 4000,
      })
      hasError = true
    }

    if (!dateDebut) {
      setDateDebutError(true)
      addToast({
        title: "خطأ في تاريخ بداية التكوين",
        description: "يجب إدخال تاريخ بداية صحيح",
        variant: "error",
        duration: 4000,
      })
      hasError = true
    }

    if (!dateFin) {
      setDateFinError(true)
      addToast({
        title: "خطأ في التاريخ نهاية التكوين",
        description: "يجب إدخال تاريخ نهاية صحيح",
        variant: "error",
        duration: 4000,
      })
      hasError = true
    }

    if (!resultat) {
      setResultatError(true)
      addToast({
        title: "خطأ في إختيار الوضعية",
        description: "يجب اختيار الوضعية",
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
      setDateError("* تاريخ نهاية التكوين غير صحيح")
      hasError = true
    }

    // Ne pas enregistrer s'il y a des erreurs
    if (hasError) {
      return
    }

    if (onSave) {
      onSave({
        formationId,
        dateDebut,
        dateFin,
        reference,
        resultat,
        moyenne,
      })
    }
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
                  <span className="text-[#1071c7]">إضافة تكوين للموظف: </span>
                  <span className="text-foreground/60 dark:text-foreground/50">
                    ال{agent.grade} {agent.nomPrenom}
                  </span>
                </>
              ) : (
                <span className="text-[#1071c7]">إضافة تكوين للموظف</span>
              )}
            </DialogTitle>
            <button onClick={handleClose} className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {agent ? `إضافة تكوين للموظف: ال${agent.grade} ${agent.nomPrenom}` : "إضافة تكوين للموظف"}
        </DialogDescription>

        <div className="overflow-y-auto">
          <ProfileBg />
          <Avatar />
          <div className="px-6 pt-4 pb-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-formation`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  الدورة التكوينية :
                </Label>
                <Select
                  dir="rtl"
                  value={formationId}
                  onValueChange={(value) => handleChange("formationId", value)}
                  disabled={isLoadingFormations}
                >
                  <SelectTrigger
                    className={`w-full rounded ${notoNaskhArabic.className} ${
                      formationError ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder={isLoadingFormations ? "جاري التحميل..." : "اختر الدورة التكوينية"} />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {formations.map((formation) => (
                      <SelectItem key={formation.id} value={formation.id} className="text-[15px]">
                        {formation.formation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-date-debut`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    تاريخ بداية التكوين :
                  </Label>
                  <Input
                    id={`${id}-date-debut`}
                    type="date"
                    value={dateDebut}
                    onChange={(e) => handleChange("dateDebut", e.target.value)}
                    required
                    className={`text-start ${
                      dateError || dateDebutError || invalidDateField === "debut"
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-date-fin`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    تاريخ نهاية التكوين :
                  </Label>

                  <Input
                    id={`${id}-date-fin`}
                    type="date"
                    value={dateFin}
                    onChange={(e) => handleChange("dateFin", e.target.value)}
                    required
                    className={`text-start ${
                      dateError || dateFinError || invalidDateField === "fin"
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {dateError && (
                    <p className={`text-xs text-red-500 leading-tight -mb-6 ${notoNaskhArabic.className}`}>
                      {dateError}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-reference`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  المرجع :
                </Label>
                <Input
                  id={`${id}-reference`}
                  type="text"
                  placeholder="أدخل المرجع"
                  value={reference}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  className={`text-right placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-resultat`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  الــوضـعـيـــة :
                </Label>
                <Select dir="rtl" value={resultat} onValueChange={(value) => handleChange("resultat", value)}>
                  <SelectTrigger
                    className={`w-full rounded ${notoNaskhArabic.className} ${
                      resultatError ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="اختر النتيجة" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    <SelectItem value="نجاح" className="text-[15px]">
                      نجاح
                    </SelectItem>
                    <SelectItem value="قيد التكوين" className="text-[15px]">
                      قيد التكوين
                    </SelectItem>
                    <SelectItem value="انقطع" className="text-[15px]">
                      انقطع
                    </SelectItem>
                    <SelectItem value="لم يلتحق" className="text-[15px]">
                      لم يلتحق
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-moyenne`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  المعدل (0-20) :
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
                  className="text-right placeholder:text-muted-foreground/50"
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
      {/* Si pas d'agent (mode autonome), wrapper avec AnimatePresence */}
      {!agent ? (
        <AnimatePresence mode="wait">{isOpen && dialogContent}</AnimatePresence>
      ) : (
        /* Si agent fourni (mode contrôlé), pas de AnimatePresence ici car il est dans le parent */
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
