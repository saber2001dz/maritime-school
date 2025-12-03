"use client"

import { useId, useState, useEffect } from "react"
import { XIcon } from "lucide-react"
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

// Pretend we have initial image files
const initialBgImage = [
  {
    name: "voilier.png",
    size: 1528737,
    type: "image/png",
    url: "/images/voilier.png",
    id: "voilier-bg-123456789",
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

export interface FormationData {
  id: string
  formation: string
  typeFormation: string
  specialite: string | null
  duree: string | null
  capaciteAbsorption: number | null
}

interface DialogueFormationProps {
  formation?: FormationData
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: FormationData) => void
  isUpdating?: boolean
}

export default function DialogueFormation({
  formation,
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  isUpdating = false,
}: DialogueFormationProps = {}) {
  const id = useId()

  const [formationName, setFormationName] = useState("")
  const [typeFormation, setTypeFormation] = useState("")
  const [specialite, setSpecialite] = useState("")
  const [duree, setDuree] = useState("")
  const [capaciteAbsorption, setCapaciteAbsorption] = useState("")
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Mettre à jour les champs quand la formation change
  useEffect(() => {
    if (formation) {
      setFormationName(formation.formation || "")
      setTypeFormation(formation.typeFormation || "")
      setSpecialite(formation.specialite || "")
      setDuree(formation.duree || "")
      setCapaciteAbsorption(formation.capaciteAbsorption?.toString() || "")
    } else {
      // Réinitialiser si pas de formation
      setFormationName("")
      setTypeFormation("")
      setSpecialite("")
      setDuree("")
      setCapaciteAbsorption("")
    }
  }, [formation])

  const handleCapaciteChange = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")
    setCapaciteAbsorption(digits)
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  const handleSave = () => {
    if (onSave && formation) {
      onSave({
        id: formation.id,
        formation: formationName,
        typeFormation,
        specialite: specialite || null,
        duree: duree || null,
        capaciteAbsorption: capaciteAbsorption ? parseInt(capaciteAbsorption) : null,
      })
    }
  }

  // Le dialogue en mode autonome (sans formation) nécessite son propre AnimatePresence
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
            <DialogTitle className={`text-start text-[#1071c7] font-bold text-md ${notoNaskhArabic.className}`}>
              تـعــديـــل بـيـــانــات الــدورة التـكـويـنـيـة
            </DialogTitle>
            <button onClick={handleClose} className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">تـعــديـــل بـيـــانــات الــدورة التـكـويـنـيـة</DialogDescription>

        <div className="overflow-y-auto">
          <ProfileBg />
          <Avatar />
          <div className="px-6 pt-4 pb-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-formation`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  الـــدورة التـكـويـنـيـة :
                </Label>
                <Input
                  id={`${id}-formation`}
                  placeholder="الـــدورة التـكـويـنـيـة"
                  type="text"
                  value={formationName}
                  onChange={(e) => setFormationName(e.target.value)}
                  required
                  autoComplete="off"
                  className={`text-base placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-type`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  نــوع التـكـويــن :
                </Label>
                <Select dir="rtl" value={typeFormation} onValueChange={(value) => setTypeFormation(value)}>
                  <SelectTrigger className={`w-full rounded ${notoNaskhArabic.className}`}>
                    <SelectValue placeholder="اختر نوع التكوين" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    <SelectItem value="تكوين إختصاص" className="text-sm">
                      تكوين إختصاص
                    </SelectItem>
                    <SelectItem value="تكوين تخصصي" className="text-sm">
                      تكوين تخصصي
                    </SelectItem>
                    <SelectItem value="تكوين مستمر" className="text-sm">
                      تكوين مستمر
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-specialite`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  الإخــتــصــاص :
                </Label>
                <Select dir="rtl" value={specialite} onValueChange={(value) => setSpecialite(value)}>
                  <SelectTrigger className={`w-full rounded ${notoNaskhArabic.className}`}>
                    <SelectValue placeholder="اختر الإختصاص" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    <SelectItem value="بحري" className="text-sm">
                      بحري
                    </SelectItem>
                    <SelectItem value="عدلي" className="text-sm">
                      عدلي
                    </SelectItem>
                    <SelectItem value="إداري" className="text-sm">
                      إداري
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-duree`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  مـــدة التـكـويــن :
                </Label>
                <Input
                  id={`${id}-duree`}
                  type="text"
                  placeholder="مـــدة التـكـويــن"
                  value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                  className={`placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${id}-capacite`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  طــاقــة الإســتــعــاب :
                </Label>
                <Input
                  id={`${id}-capacite`}
                  type="text"
                  inputMode="numeric"
                  placeholder="طــاقــة الإســتــعــاب"
                  value={capaciteAbsorption}
                  onChange={(e) => handleCapaciteChange(e.target.value)}
                  className={`placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                  autoComplete="off"
                />
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
      {/* Si pas de formation (mode autonome), wrapper avec AnimatePresence */}
      {!formation ? (
        <AnimatePresence mode="wait">{isOpen && dialogContent}</AnimatePresence>
      ) : (
        /* Si formation fournie (mode contrôlé), pas de AnimatePresence ici car il est dans le parent */
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
