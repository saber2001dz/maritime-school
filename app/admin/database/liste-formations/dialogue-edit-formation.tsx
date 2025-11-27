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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const notoNaskhArabic = localFont({
  src: "../../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

interface Formation {
  id: string
  formation: string
  typeFormation: string
  specialite?: string | null
  duree?: string | null
  capaciteAbsorption?: number | null
}

interface DialogueEditFormationProps {
  formation: Formation | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Formation>) => Promise<void>
}

export function DialogueEditFormation({
  formation,
  isOpen,
  onClose,
  onSave,
}: DialogueEditFormationProps) {
  const [formationName, setFormationName] = useState("")
  const [typeFormation, setTypeFormation] = useState("")
  const [specialite, setSpecialite] = useState("")
  const [duree, setDuree] = useState("")
  const [capaciteAbsorption, setCapaciteAbsorption] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (formation) {
      setFormationName(formation.formation)
      setTypeFormation(formation.typeFormation)
      setSpecialite(formation.specialite || "none")
      setDuree(formation.duree || "")
      setCapaciteAbsorption(formation.capaciteAbsorption?.toString() || "")
    }
  }, [formation])

  const handleCapaciteChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    setCapaciteAbsorption(cleaned)
  }

  const handleSave = async () => {
    if (!formation) return

    if (!formationName || !typeFormation) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        formation: formationName,
        typeFormation,
        specialite: specialite === "none" ? null : specialite,
        duree: duree || null,
        capaciteAbsorption: capaciteAbsorption ? parseInt(capaciteAbsorption) : null,
      })
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
            تـعــديـــل بـيـــانــات التـكـويـن
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {/* Formation */}
          <div className="space-y-2">
            <Label
              htmlFor="formation"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              التـكـويـن
            </Label>
            <Input
              id="formation"
              value={formationName}
              onChange={(e) => setFormationName(e.target.value)}
              className={notoNaskhArabic.className}
              dir="rtl"
            />
          </div>

          {/* Type de Formation */}
          <div className="space-y-2">
            <Label
              htmlFor="typeFormation"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              نـوع التـكـويـن
            </Label>
            <Select dir="rtl" value={typeFormation} onValueChange={setTypeFormation}>
              <SelectTrigger
                id="typeFormation"
                className={`w-full ${notoNaskhArabic.className}`}
              >
                <SelectValue placeholder="اختر نوع التكوين" />
              </SelectTrigger>
              <SelectContent className={notoNaskhArabic.className}>
                <SelectItem value="تكوين إختصاص" className="text-sm">تكوين إختصاص</SelectItem>
                <SelectItem value="تكوين تخصصي" className="text-sm">تكوين تخصصي</SelectItem>
                <SelectItem value="تكوين مستمر" className="text-sm">تكوين مستمر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Spécialité */}
          <div className="space-y-2">
            <Label
              htmlFor="specialite"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              الإختـصــاص
            </Label>
            <Select dir="rtl" value={specialite} onValueChange={setSpecialite}>
              <SelectTrigger
                id="specialite"
                className={`w-full ${notoNaskhArabic.className}`}
              >
                <SelectValue placeholder="اختر الإختصاص" />
              </SelectTrigger>
              <SelectContent className={notoNaskhArabic.className}>
                <SelectItem value="none" className="text-sm">-</SelectItem>
                <SelectItem value="بحري" className="text-sm">بحري</SelectItem>
                <SelectItem value="عدلي" className="text-sm">عدلي</SelectItem>
                <SelectItem value="إداري" className="text-sm">إداري</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Durée et Capacité */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="duree"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                المــدة
              </Label>
              <Input
                id="duree"
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
                className={notoNaskhArabic.className}
                dir="rtl"
                placeholder="مثال: 6 أشهر"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="capaciteAbsorption"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                قـدرة الإستـيـعــاب
              </Label>
              <Input
                id="capaciteAbsorption"
                type="text"
                value={capaciteAbsorption}
                onChange={(e) => handleCapaciteChange(e.target.value)}
                className="text-right"
                dir="rtl"
              />
            </div>
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
