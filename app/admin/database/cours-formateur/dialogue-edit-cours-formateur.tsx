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
import { type CoursFormateurWithRelations } from "./cours-formateurs-table"

const notoNaskhArabic = localFont({
  src: "../../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

interface DialogueEditCoursFormateurProps {
  coursFormateur: CoursFormateurWithRelations | null
  isOpen: boolean
  onClose: () => void
  onSave: (coursFormateur: CoursFormateurWithRelations) => Promise<{ success: boolean; error?: string }>
}

export function DialogueEditCoursFormateur({
  coursFormateur,
  isOpen,
  onClose,
  onSave,
}: DialogueEditCoursFormateurProps) {
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [nombreHeures, setNombreHeures] = useState("")
  const [reference, setReference] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (coursFormateur) {
      setDateDebut(coursFormateur.dateDebut || "")
      setDateFin(coursFormateur.dateFin || "")
      setNombreHeures(coursFormateur.nombreHeures.toString() || "")
      setReference(coursFormateur.reference || "")
    }
  }, [coursFormateur])

  const handleSave = async () => {
    if (!coursFormateur) return

    if (!dateDebut || !dateFin || !nombreHeures) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    const dateDebutObj = new Date(dateDebut)
    const dateFinObj = new Date(dateFin)
    if (dateFinObj < dateDebutObj) {
      alert("La date de fin doit être postérieure à la date de début")
      return
    }

    const heures = parseFloat(nombreHeures)
    if (heures <= 0) {
      alert("Le nombre d'heures doit être supérieur à 0")
      return
    }

    setIsLoading(true)
    try {
      const result = await onSave({
        ...coursFormateur,
        dateDebut,
        dateFin,
        nombreHeures: heures,
        reference,
      })

      if (result.success) {
        onClose()
      } else {
        alert(result.error || "Erreur lors de la sauvegarde")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (!coursFormateur) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle
            className={`text-xl font-bold text-right text-[#1071c7] ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            تـعــديـــل بـيـــانــات الـدورة
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {/* Formateur (Read-only) */}
          <div className="space-y-2">
            <Label
              htmlFor="formateur"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              المـكــون
            </Label>
            <Input
              id="formateur"
              value={`${coursFormateur.formateur.grade} ${coursFormateur.formateur.nomPrenom}`}
              readOnly
              disabled
              className={`bg-muted cursor-not-allowed ${notoNaskhArabic.className}`}
              dir="rtl"
            />
          </div>

          {/* Cours (Read-only) */}
          <div className="space-y-2">
            <Label
              htmlFor="cours"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              الــدورة
            </Label>
            <Input
              id="cours"
              value={coursFormateur.cours.titre}
              readOnly
              disabled
              className={`bg-muted cursor-not-allowed ${notoNaskhArabic.className}`}
              dir="rtl"
            />
          </div>

          {/* Unité (Read-only) */}
          <div className="space-y-2">
            <Label
              htmlFor="unite"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              الـوحــدة
            </Label>
            <Input
              id="unite"
              value={coursFormateur.formateur.unite}
              readOnly
              disabled
              className={`bg-muted cursor-not-allowed ${notoNaskhArabic.className}`}
              dir="rtl"
            />
          </div>

          {/* Date Début et Date Fin */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="dateDebut"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                تــاريــخ الــبــدايــة
              </Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="dateFin"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                تــاريــخ الــنــهــايــة
              </Label>
              <Input
                id="dateFin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          {/* Nombre d'heures */}
          <div className="space-y-2">
            <Label
              htmlFor="nombreHeures"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              عــدد الــســاعــات
            </Label>
            <Input
              id="nombreHeures"
              type="number"
              min="0.01"
              step="0.5"
              value={nombreHeures}
              onChange={(e) => setNombreHeures(e.target.value)}
              className="text-right"
              dir="rtl"
            />
          </div>

          {/* Référence */}
          <div className="space-y-2">
            <Label
              htmlFor="reference"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              المـرجــع (اخـتـيــاري)
            </Label>
            <Input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={notoNaskhArabic.className}
              dir="rtl"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            إلـغــاء
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${notoNaskhArabic.className}`}
            dir="rtl"
          >
            {isLoading ? "جاري الحفظ..." : "سـجـل البيــانــات"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
