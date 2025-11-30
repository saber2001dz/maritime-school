"use client"

import { useState, useEffect } from "react"
import localFont from "next/font/local"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const notoNaskhArabic = localFont({
  src: "../../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

interface Cours {
  id: string
  titre: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface DialogueEditCoursProps {
  cours: Cours | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Cours>) => Promise<void>
}

export function DialogueEditCours({
  cours,
  isOpen,
  onClose,
  onSave,
}: DialogueEditCoursProps) {
  const [titre, setTitre] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (cours) {
      setTitre(cours.titre)
    }
  }, [cours])

  const handleSave = async () => {
    if (!cours) return

    if (!titre.trim()) {
      alert("Veuillez saisir un titre pour le cours")
      return
    }

    setIsLoading(true)
    try {
      await onSave({ titre })
      onClose()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle
            className={`text-xl font-bold text-right text-[#1071c7] ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            تعديل بيانات الدورة
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="titre"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              عنوان الدورة
            </Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className={notoNaskhArabic.className}
              dir="rtl"
              placeholder="أدخل عنوان الدورة"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            {isLoading ? "جاري الحفظ..." : "سجل البيانات"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
