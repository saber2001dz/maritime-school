"use client"

import { useId, useState, useEffect } from "react"
import { XIcon, Trash2 } from "lucide-react"
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
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

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

export interface CoursData {
  id: string
  titre: string
}

interface DialogueCoursProps {
  cours?: CoursData
  isOpen?: boolean
  onClose?: () => void
  onSave?: (data: CoursData) => void
  onDelete?: (id: string) => void
  isUpdating?: boolean
  isDeleting?: boolean
}

export default function DialogueCours({
  cours,
  isOpen: controlledIsOpen,
  onClose,
  onSave,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: DialogueCoursProps = {}) {
  const id = useId()

  const [titre, setTitre] = useState("")
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Utiliser controlledIsOpen si fourni, sinon utiliser l'état interne
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  // Mettre à jour les champs quand le cours change
  useEffect(() => {
    if (cours) {
      setTitre(cours.titre || "")
    } else {
      // Réinitialiser si pas de cours
      setTitre("")
    }
  }, [cours])

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  const handleSave = () => {
    if (onSave && cours) {
      onSave({
        id: cours.id,
        titre: titre.trim(),
      })
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete && cours) {
      onDelete(cours.id)
    }
    setDeleteDialogOpen(false)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
  }

  // Le dialogue en mode autonome (sans cours) nécessite son propre AnimatePresence
  const dialogContent = (
    <Dialog open={true} modal={true}>
      <DialogContent
        className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg bg-white dark:bg-slate-900 [&>button:last-child]:top-3.5 top-[45%]!"
        showClose={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="contents space-y-0">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <DialogTitle className={`text-start text-[#1071c7] font-bold text-md ${notoNaskhArabic.className}`}>
              تـعــديـــل بـيـــانــات الــدرس
            </DialogTitle>
            <button onClick={handleClose} className="p-1 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">تـعــديـــل بـيـــانــات الــدرس</DialogDescription>

        <div className="overflow-y-auto">
          <ProfileBg />
          <Avatar />
          <div className="px-6 pt-6 pb-16">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-titre`} className={`text-sm font-light ${notoNaskhArabic.className}`}>
                  عـنــوان الــدرس :
                </Label>
                <Input
                  id={`${id}-titre`}
                  placeholder="عـنــوان الــدرس"
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                  autoComplete="off"
                  className={`text-base placeholder:text-muted-foreground/50 ${notoNaskhArabic.className}`}
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
      {/* Si pas de cours (mode autonome), wrapper avec AnimatePresence */}
      {!cours ? (
        <AnimatePresence mode="wait">{isOpen && dialogContent}</AnimatePresence>
      ) : (
        /* Si cours fourni (mode contrôlé), pas de AnimatePresence ici car il est dans le parent */
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
              هل أنت متأكد من حذف هذا الدرس؟ هذا الإجراء لا يمكن التراجع عنه.
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
