"use client"

import { useId, useState, useEffect } from "react"
import { XIcon, CalendarDays } from "lucide-react"
import localFont from "next/font/local"
import { AnimatePresence } from "framer-motion"
import Image from "next/image"

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
import { Spinner } from "@/components/ui/spinner"

const notoNaskhArabic = localFont({
  src: "../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

// Images initiales
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

interface Formation {
  id: string
  formation: string
  typeFormation: string
  specialite: string | null
}

export interface SessionFormationData {
  id: string
  formationId: string
  dateDebut: Date
  dateFin: Date
  nombreParticipants: number
  reference: string | null
  statut: string
  createdAt: Date
  formation: {
    id: string
    formation: string
    typeFormation: string
    specialite: string | null
  }
}

interface DialogueSessionFormationProps {
  session?: SessionFormationData
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: SessionFormationData) => void
  isUpdating?: boolean
}

export default function DialogueSessionFormation({
  session,
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  isUpdating = false,
}: DialogueSessionFormationProps = {}) {
  const id = useId()

  const [formationId, setFormationId] = useState("")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [reference, setReference] = useState("")
  const [formations, setFormations] = useState<Formation[]>([])
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [dateError, setDateError] = useState("")
  const [hasBlurred, setHasBlurred] = useState(false)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Charger la liste des formations depuis la base de données
  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch("/api/formations")
        if (response.ok) {
          const data = await response.json()
          // L'API retourne directement un tableau de formations
          setFormations(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des formations:", error)
      }
    }
    fetchFormations()
  }, [])

  // Fonction pour convertir Date en format YYYY-MM-DD
  const formatDateForInput = (date: Date): string => {
    if (!date) return ""
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Mettre à jour les champs quand la session change
  useEffect(() => {
    if (session) {
      setFormationId(session.formationId || "")
      setDateDebut(formatDateForInput(session.dateDebut))
      setDateFin(formatDateForInput(session.dateFin))
      setReference(session.reference || "")
      setDateError("") // Réinitialiser l'erreur
      setHasBlurred(false) // Réinitialiser l'état de blur
    } else {
      // Réinitialiser si pas de session
      setFormationId("")
      setDateDebut("")
      setDateFin("")
      setReference("")
      setDateError("")
      setHasBlurred(false)
    }
  }, [session])

  // Fonction de validation des dates
  const validateDates = () => {
    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut)
      const fin = new Date(dateFin)

      if (debut > fin) {
        setDateError("يجب أن يكون تاريخ النهاية مساوياً أو أكبر من تاريخ البداية")
      } else {
        setDateError("")
      }
    } else {
      setDateError("")
    }
  }

  // Gestionnaire onBlur pour l'input تاريخ النهاية
  const handleDateFinBlur = () => {
    setHasBlurred(true)
    validateDates()
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  const handleSave = () => {
    if (onSave && session) {
      // Créer les dates avec les heures de travail
      // Stocker en UTC: 09:00 UTC pour afficher 08:00 GMT+1
      //                  18:00 UTC pour afficher 17:00 GMT+1
      const debut = new Date(dateDebut)
      debut.setHours(9, 0, 0, 0) // 09:00 UTC → 08:00 GMT+1

      const fin = new Date(dateFin)
      fin.setHours(18, 0, 0, 0) // 18:00 UTC → 17:00 GMT+1

      // Créer une copie de la session avec les nouvelles valeurs
      const updatedSession: SessionFormationData = {
        ...session,
        formationId: formationId,
        dateDebut: debut,
        dateFin: fin,
        reference: reference.trim() || null,
      }
      onSave(updatedSession)
    }
  }

  // Le dialogue en mode autonome (sans session) nécessite son propre AnimatePresence
  const dialogContent = (
    <Dialog open={true} modal={true}>
      <DialogContent
        className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg bg-white dark:bg-slate-900 [&>button:last-child]:top-3.5 top-[45%]"
        showClose={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="contents space-y-0">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <DialogTitle className={`text-start font-bold text-md ${notoNaskhArabic.className}`}>
              <span className="text-[#1071c7]">تـعــديـــل بـيـــانــات الـــدورة</span>
            </DialogTitle>
            <button onClick={handleClose} className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">
          تـعــديـــل بـيـــانــات الـــدورة
        </DialogDescription>

        <div className="overflow-y-auto">
          <ProfileBg />
          <Avatar />
          <div className="px-6 pt-6 pb-6">
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={`${id}-formation`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  التكوين :
                </Label>
                <Select dir="rtl" value={formationId} onValueChange={(value) => setFormationId(value)}>
                  <SelectTrigger className={`w-full rounded ${notoNaskhArabic.className}`}>
                    <SelectValue placeholder="اختر التكوين" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {formations.map((formation) => (
                      <SelectItem key={formation.id} value={formation.id} className="text-sm">
                        {formation.formation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-date-debut`} className={`text-sm font-light flex items-center gap-2 ${notoNaskhArabic.className}`}>
                    <CalendarDays size={16} className="text-muted-foreground" />
                    تاريخ البداية :
                  </Label>
                <Input
                  id={`${id}-date-debut`}
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                  disabled={isUpdating}
                  className="text-base"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`${id}-date-fin`} className={`text-sm font-light flex items-center gap-2 ${notoNaskhArabic.className}`}>
                  <CalendarDays size={16} className="text-muted-foreground" />
                  تاريخ النهاية :
                </Label>
                <Input
                  id={`${id}-date-fin`}
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  onBlur={handleDateFinBlur}
                  required
                  disabled={isUpdating}
                  className={`text-base ${dateError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
            </div>
            <div className="space-y-2 mt-6">
              <Label htmlFor={`${id}-reference`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                المرجع :
              </Label>
              <Input
                id={`${id}-reference`}
                placeholder="أدخل المرجع (اختياري)"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                maxLength={100}
                disabled={isUpdating}
                autoComplete="off"
                className={`text-base placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
              />
            </div>
            {/* Espace réservé pour le message d'erreur */}
            <div className="h-2 -mb-2 flex items-start">
              {dateError && (
                <div className={`text-xs text-red-600 dark:text-red-400 text-right ${notoNaskhArabic.className}`}>
                  {dateError}
                </div>
              )}
            </div>
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
            disabled={isUpdating || !!dateError || !formationId || !dateDebut || !dateFin}
          >
            {isUpdating ? "جاري الحفظ..." : "سـجـل البيــانــات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      {/* Si pas de session (mode autonome), wrapper avec AnimatePresence */}
      {!session ? (
        <AnimatePresence mode="wait">{isOpen && dialogContent}</AnimatePresence>
      ) : (
        /* Si session fournie (mode contrôlé), pas de AnimatePresence ici car il est dans le parent */
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
