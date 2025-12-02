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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

const notoNaskhArabic = localFont({
  src: "../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

// Pretend we have initial image files
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

export interface AgentData {
  id: string
  nomPrenom: string
  grade: string
  matricule: string
  responsabilite: string
  telephone: number
}

interface DialogueStyleProps {
  agent?: AgentData
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: AgentData) => void
  isUpdating?: boolean
}

export default function DialogueStyle({
  agent,
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  isUpdating = false,
}: DialogueStyleProps = {}) {
  const id = useId()

  const maxLength = 180

  const [nomPrenom, setNomPrenom] = useState("")
  const [telephone, setTelephone] = useState("")
  const [grade, setGrade] = useState("")
  const [matricule, setMatricule] = useState("")
  const [responsabilite, setResponsabilite] = useState("")
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Mettre à jour les champs quand l'agent change
  useEffect(() => {
    if (agent) {
      setNomPrenom(agent.nomPrenom || "")
      setTelephone(formatPhoneNumber(agent.telephone.toString()))
      setGrade(agent.grade || "")
      setMatricule(agent.matricule || "")
      setResponsabilite(agent.responsabilite || "")
    } else {
      // Réinitialiser si pas d'agent
      setNomPrenom("")
      setTelephone("")
      setGrade("")
      setMatricule("")
      setResponsabilite("")
    }
  }, [agent])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Limit to 8 digits
    const limitedDigits = digits.slice(0, 8)

    // Format as xx xxx xxx
    if (limitedDigits.length <= 2) {
      return limitedDigits
    } else if (limitedDigits.length <= 5) {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`
    } else {
      return `${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2, 5)} ${limitedDigits.slice(5)}`
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setTelephone(formatted)
  }

  const handleMatriculeChange = (value: string) => {
    // Remove all non-digit characters and limit to 6 digits
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setMatricule(digits)
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  const handleSave = () => {
    if (onSave && agent) {
      // Convertir le téléphone formaté en nombre
      const phoneDigits = telephone.replace(/\D/g, "")
      onSave({
        id: agent.id,
        nomPrenom,
        grade,
        matricule,
        responsabilite,
        telephone: parseInt(phoneDigits) || 0,
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
                  <span className="text-[#1071c7]">تـعــديـــل بـيـــانــات المتـــربــص: </span>
                  <span className="text-foreground/60 dark:text-foreground/50">
                    ال{agent.grade} {agent.nomPrenom}
                  </span>
                </>
              ) : (
                <span className="text-[#1071c7]">تـعــديـــل بـيـــانــات المتـــربــص</span>
              )}
            </DialogTitle>
            <button onClick={handleClose} className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {agent ? `تـعــديـــل بـيـــانــات المتـــربــص: ال${agent.grade} ${agent.nomPrenom}` : "تـعــديـــل بـيـــانــات المتـــربــص"}
        </DialogDescription>

        <div className="overflow-y-auto">
          <ProfileBg />
          <Avatar />
          <div className="px-6 pt-4 pb-6">
            <form className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-first-name`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    الإســم و اللـقــب :
                  </Label>
                  <Input
                    id={`${id}-first-name`}
                    placeholder="الإســم و اللقـــب"
                    type="text"
                    value={nomPrenom}
                    onChange={(e) => setNomPrenom(e.target.value)}
                    required
                    autoComplete="off"
                    className={`text-base placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-last-name`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                    الــرقــــم :
                  </Label>
                  <Input
                    id={`${id}-last-name`}
                    placeholder="الــرقـــم"
                    type="text"
                    inputMode="numeric"
                    value={matricule}
                    onChange={(e) => handleMatriculeChange(e.target.value)}
                    required
                    className={`placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-grade`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  الــرتـبــــة :
                </Label>
                <Select dir="rtl" value={grade} onValueChange={(value) => setGrade(value)}>
                  <SelectTrigger className={`w-full rounded ${notoNaskhArabic.className}`}>
                    <SelectValue placeholder="اختر الرتبة" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    <SelectItem value="عميد" className="text-sm">
                      عميد
                    </SelectItem>
                    <SelectItem value="عقيد" className="text-sm">
                      عقيد
                    </SelectItem>
                    <SelectItem value="مقدم" className="text-sm">
                      مقدم
                    </SelectItem>
                    <SelectItem value="رائد" className="text-sm">
                      رائد
                    </SelectItem>
                    <SelectItem value="نقيب" className="text-sm">
                      نقيب
                    </SelectItem>
                    <SelectItem value="ملازم أول" className="text-sm">
                      ملازم أول
                    </SelectItem>
                    <SelectItem value="ملازم" className="text-sm">
                      ملازم
                    </SelectItem>
                    <SelectItem value="عريف أول" className="text-sm">
                      عريف أول
                    </SelectItem>
                    <SelectItem value="عريف" className="text-sm">
                      عريف
                    </SelectItem>
                    <SelectItem value="وكيل أول" className="text-sm">
                      وكيل أول
                    </SelectItem>
                    <SelectItem value="وكيل" className="text-sm">
                      وكيل
                    </SelectItem>
                    <SelectItem value="رقيب أول" className="text-sm">
                      رقيب أول
                    </SelectItem>
                    <SelectItem value="رقيب" className="text-sm">
                      رقيب
                    </SelectItem>
                    <SelectItem value="حرس" className="text-sm">
                      حرس
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-telephone`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  رقــم الهــاتــف :
                </Label>
                <Input
                  id={`${id}-telephone`}
                  type="text"
                  inputMode="numeric"
                  placeholder="xx xxx xxx"
                  value={telephone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`text-right placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
                  dir="ltr"
                  autoComplete="off"
                />
              </div>
              <div className="*:not-first:mt-2">
                <Label htmlFor={`${id}-bio`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  المســـروليــة :
                </Label>
                <Textarea
                  id={`${id}-bio`}
                  placeholder="أكتب هنا المسؤولية الحالية للمتربص"
                  maxLength={maxLength}
                  value={responsabilite}
                  onChange={(e) => setResponsabilite(e.target.value)}
                  aria-describedby={`${id}-description`}
                  className={`placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
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
