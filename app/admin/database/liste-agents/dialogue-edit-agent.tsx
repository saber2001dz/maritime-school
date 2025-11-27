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
import { Textarea } from "@/components/ui/textarea"

const notoNaskhArabic = localFont({
  src: "../../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

interface Agent {
  id: string
  nomPrenom: string
  grade: string
  matricule: string
  responsabilite: string
  telephone: number
  categorie: string
}

interface DialogueEditAgentProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Agent>) => Promise<void>
}

const getCategorieFromGrade = (
  grade: string
): "ضابط سامي" | "ضابط" | "ضابط صف" | "هيئة الرقباء" => {
  const normalized = grade.trim()

  // ضابط سامي: عميد - عقيد - مقدم - رائد
  if (["عميد", "عقيد", "مقدم", "رائد"].includes(normalized)) {
    return "ضابط سامي"
  }

  // ضابط: ملازم - ملازم أول - نقيب
  if (
    ["ملازم", "ملازم أول", "ملازم اول", "ملازم 1", "نقيب"].includes(normalized)
  ) {
    return "ضابط"
  }

  // ضابط صف: وكيل أول - وكيل - عريف أول - عريف
  if (
    [
      "وكيل أول",
      "وكيل اول",
      "وكيل 1",
      "وكيل",
      "عريف أول",
      "عريف اول",
      "عريف 1",
      "عريف",
    ].includes(normalized)
  ) {
    return "ضابط صف"
  }

  // هيئة الرقباء: حرس - رقيب أول - رقيب
  if (
    ["حرس", "رقيب أول", "رقيب اول", "رقيب 1", "رقيب"].includes(normalized)
  ) {
    return "هيئة الرقباء"
  }

  return "ضابط صف"
}

export function DialogueEditAgent({
  agent,
  isOpen,
  onClose,
  onSave,
}: DialogueEditAgentProps) {
  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [matricule, setMatricule] = useState("")
  const [grade, setGrade] = useState("")
  const [categorie, setCategorie] = useState("")
  const [responsabilite, setResponsabilite] = useState("")
  const [telephone, setTelephone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (agent) {
      // Séparer nom et prénom
      const parts = agent.nomPrenom.split(" ")
      setPrenom(parts[0] || "")
      setNom(parts.slice(1).join(" ") || "")
      setMatricule(agent.matricule)
      setGrade(agent.grade)
      setCategorie(getCategorieFromGrade(agent.grade))
      setResponsabilite(agent.responsabilite)
      setTelephone(agent.telephone.toString())
    }
  }, [agent])

  useEffect(() => {
    if (grade) {
      setCategorie(getCategorieFromGrade(grade))
    }
  }, [grade])

  const handleTelephoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 8) {
      setTelephone(cleaned)
    }
  }

  const formatTelephone = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`
  }

  const handleMatriculeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 6) {
      setMatricule(cleaned)
    }
  }

  const handleSave = async () => {
    if (!agent) return

    const nomPrenom = `${prenom} ${nom}`.trim()

    if (!nomPrenom || !grade || !matricule || !telephone) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (telephone.length !== 8) {
      alert("Le numéro de téléphone doit contenir 8 chiffres")
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        nomPrenom,
        grade,
        matricule,
        responsabilite,
        telephone: parseInt(telephone),
        categorie: getCategorieFromGrade(grade),
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
            تـعــديـــل بـيـــانــات المتـــربــص
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {/* Prénom et Nom */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="prenom"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                الإســم
              </Label>
              <Input
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className={notoNaskhArabic.className}
                dir="rtl"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="nom"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                اللـقــب
              </Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={notoNaskhArabic.className}
                dir="rtl"
              />
            </div>
          </div>

          {/* Matricule */}
          <div className="space-y-2">
            <Label
              htmlFor="matricule"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              الــرقــــم
            </Label>
            <Input
              id="matricule"
              type="text"
              value={matricule}
              onChange={(e) => handleMatriculeChange(e.target.value)}
              maxLength={6}
              dir="rtl"
            />
          </div>

          {/* Grade et Catégorie */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="grade"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                الــرتـبــــة
              </Label>
              <Select dir="rtl" value={grade} onValueChange={setGrade}>
                <SelectTrigger
                  id="grade"
                  className={`w-full ${notoNaskhArabic.className}`}
                >
                  <SelectValue placeholder="اختر الرتبة" />
                </SelectTrigger>
                <SelectContent className={notoNaskhArabic.className}>
                  <SelectItem value="عميد" className="text-sm">عميد</SelectItem>
                  <SelectItem value="عقيد" className="text-sm">عقيد</SelectItem>
                  <SelectItem value="مقدم" className="text-sm">مقدم</SelectItem>
                  <SelectItem value="رائد" className="text-sm">رائد</SelectItem>
                  <SelectItem value="نقيب" className="text-sm">نقيب</SelectItem>
                  <SelectItem value="ملازم أول" className="text-sm">ملازم أول</SelectItem>
                  <SelectItem value="ملازم" className="text-sm">ملازم</SelectItem>
                  <SelectItem value="عريف أول" className="text-sm">عريف أول</SelectItem>
                  <SelectItem value="عريف" className="text-sm">عريف</SelectItem>
                  <SelectItem value="وكيل أول" className="text-sm">وكيل أول</SelectItem>
                  <SelectItem value="وكيل" className="text-sm">وكيل</SelectItem>
                  <SelectItem value="رقيب أول" className="text-sm">رقيب أول</SelectItem>
                  <SelectItem value="رقيب" className="text-sm">رقيب</SelectItem>
                  <SelectItem value="حرس" className="text-sm">حرس</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="categorie"
                className={notoNaskhArabic.className}
                dir="rtl"
              >
                الــصـنــف
              </Label>
              <Input
                id="categorie"
                value={categorie}
                readOnly
                disabled
                className={`bg-muted cursor-not-allowed ${notoNaskhArabic.className}`}
                dir="rtl"
              />
            </div>
          </div>

          {/* Responsabilité */}
          <div className="space-y-2">
            <Label
              htmlFor="responsabilite"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              المســـروليــة
            </Label>
            <Textarea
              id="responsabilite"
              value={responsabilite}
              onChange={(e) => setResponsabilite(e.target.value)}
              maxLength={180}
              rows={3}
              className={notoNaskhArabic.className}
              dir="rtl"
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label
              htmlFor="telephone"
              className={notoNaskhArabic.className}
              dir="rtl"
            >
              رقــم الهــاتــف
            </Label>
            <Input
              id="telephone"
              type="text"
              value={formatTelephone(telephone)}
              onChange={(e) => handleTelephoneChange(e.target.value)}
              placeholder="__ ___ ___"
              className="text-right"
              dir="ltr"
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
