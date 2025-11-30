"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import localFont from "next/font/local"
import { X, ChevronRight } from "lucide-react"

const notoNaskhArabic = localFont({
  src: "../../fonts/NotoNaskhArabic.woff2",
  display: "swap",
})

export default function NouveauFormateurPage() {
  const router = useRouter()
  const RIBInputRef = React.useRef<HTMLInputElement>(null)
  const [formData, setFormData] = React.useState({
    nomPrenom: "",
    grade: "",
    unite: "",
    responsabilite: "",
    numero: "",
    RIB: "",
  })
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState({
    nomPrenom: false,
    grade: false,
    unite: false,
    numero: false,
    RIB: false,
  })

  const grades = [
    { category: "ضابط سامي", values: ["عميد", "عقيد", "مقدم", "رائد"] },
    { category: "ضابط", values: ["نقيب", "ملازم أول", "ملازم"] },
    { category: "ضابط صف", values: ["عريف أول", "عريف", "وكيل أول", "وكيل"] },
    { category: "هيئة الرقباء", values: ["رقيب أول", "رقيب", "حرس"] },
  ]

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
    handleChange("numero", formatted)
  }

  const handleRIBChange = (value: string) => {
    // Remove all non-digit characters and limit to 20 digits
    const digits = value.replace(/\D/g, "").slice(0, 20)
    handleChange("RIB", digits)
  }

  const validateForm = () => {
    const newErrors = {
      nomPrenom: formData.nomPrenom.trim() === "",
      grade: formData.grade === "",
      unite: formData.unite.trim() === "",
      numero: formData.numero.trim() === "",
      RIB: formData.RIB.length !== 20,
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/formateurs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomPrenom: formData.nomPrenom.trim(),
          grade: formData.grade,
          unite: formData.unite.trim(),
          responsabilite: formData.responsabilite.trim(),
          telephone: formData.numero,
          RIB: formData.RIB,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Si c'est une erreur de RIB dupliqué
        if (response.status === 409) {
          setErrors({ ...errors, RIB: true })
          // Donner le focus et sélectionner le contenu
          setTimeout(() => {
            if (RIBInputRef.current) {
              RIBInputRef.current.focus()
              RIBInputRef.current.select()
            }
          }, 100)
        }
        throw new Error(data.error || 'Erreur lors de la création du formateur')
      }

      setSuccess(true)

      // Rediriger vers la liste des formateurs après 2 secondes
      setTimeout(() => {
        router.push('/liste-formateur')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-start justify-center bg-white dark:bg-black p-4 pt-18">
      <motion.div
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6"
        transition={{ duration: 0.6 }}
      >
        {/* Bouton retour en haut à droite */}
        {!success && (
          <button
            onClick={() => router.push('/liste-formateur')}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Retour"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}

        <h2 className="text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
          {success ? "تـم إنشـاء المكــون بنجـاح!" : "مكــون جــديــد"}
        </h2>
        <p className={`text-center text-md text-gray-500 dark:text-gray-300 -mt-3 mb-4 ${notoNaskhArabic.className}`}>
          {!success && "إمــلأ معلــومــات المكــون الجــديــد"}
        </p>

        <AnimatePresence>
          {!success && (
            <motion.div
              key="form"
              className="flex flex-col gap-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <Label className="text-[12px]" htmlFor="nomPrenom">
                  الإســم و اللقــب
                </Label>
                <div className="relative">
                  <Input
                    id="nomPrenom"
                    type="text"
                    placeholder="أدخل الإسم و اللقب"
                    value={formData.nomPrenom}
                    onChange={(e) => {
                      handleChange("nomPrenom", e.target.value)
                      if (errors.nomPrenom) setErrors({ ...errors, nomPrenom: false })
                    }}
                    className={`mt-2 ${notoNaskhArabic.className} ${errors.nomPrenom ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    autoComplete="off"
                    required
                  />
                  {errors.nomPrenom && (
                    <X className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Label className="text-[12px]" htmlFor="grade">
                  الــرتـبــــــة
                </Label>
                <Select
                  dir="rtl"
                  value={formData.grade}
                  onValueChange={(value) => {
                    handleChange("grade", value)
                    if (errors.grade) setErrors({ ...errors, grade: false })
                  }}
                  required
                >
                  <SelectTrigger
                    className={`mt-2 w-full rounded ${notoNaskhArabic.className} ${errors.grade ? "border-red-500 focus:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="اختر الرتبة" />
                  </SelectTrigger>
                  <SelectContent className={notoNaskhArabic.className}>
                    {grades.map((gradeGroup) => (
                      <React.Fragment key={gradeGroup.category}>
                        {gradeGroup.values.map((grade) => (
                          <SelectItem key={grade} value={grade} className="text-[15px]">
                            {grade}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Label className="text-[12px]" htmlFor="unite">
                  الــوحــدة
                </Label>
                <div className="relative">
                  <Input
                    id="unite"
                    type="text"
                    placeholder="أدخل الوحدة"
                    value={formData.unite}
                    onChange={(e) => {
                      handleChange("unite", e.target.value)
                      if (errors.unite) setErrors({ ...errors, unite: false })
                    }}
                    className={`mt-2 rounded ${notoNaskhArabic.className} ${errors.unite ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    autoComplete="off"
                    required
                  />
                  {errors.unite && (
                    <X className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label className="text-[12px]" htmlFor="responsabilite">
                  المســؤوليــة
                </Label>
                <Input
                  id="responsabilite"
                  type="text"
                  placeholder="أدخل المسؤولية"
                  value={formData.responsabilite}
                  onChange={(e) => handleChange("responsabilite", e.target.value)}
                  className={`mt-2 rounded ${notoNaskhArabic.className}`}
                  autoComplete="off"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <Label className="text-[12px]" htmlFor="numero">
                  رقـم الهـاتـف
                </Label>
                <div className="relative">
                  <Input
                    id="numero"
                    type="text"
                    inputMode="numeric"
                    placeholder="xx xxx xxx"
                    value={formData.numero}
                    onChange={(e) => {
                      handlePhoneChange(e.target.value)
                      if (errors.numero) setErrors({ ...errors, numero: false })
                    }}
                    className={`mt-2 rounded ${notoNaskhArabic.className} text-right ${errors.numero ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    dir="ltr"
                    autoComplete="off"
                    required
                  />
                  {errors.numero && (
                    <X className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Label className="text-[12px]" htmlFor="RIB">
                  RIB
                </Label>
                <div className="relative">
                  <Input
                    ref={RIBInputRef}
                    id="RIB"
                    type="text"
                    inputMode="numeric"
                    placeholder="أدخل RIB (20 رقم)"
                    value={formData.RIB}
                    onChange={(e) => {
                      handleRIBChange(e.target.value)
                      if (errors.RIB) setErrors({ ...errors, RIB: false })
                    }}
                    className={`mt-2 rounded ${notoNaskhArabic.className} text-right ${errors.RIB ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    dir="ltr"
                    maxLength={20}
                    autoComplete="off"
                    required
                  />
                  {errors.RIB && (
                    <X className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-red-500" />
                  )}
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                >
                  <p className={`text-sm text-red-600 dark:text-red-400 text-center ${notoNaskhArabic.className}`}>
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Séparateur */}
              <div className="w-full h-px bg-border my-6" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="flex gap-3 w-full"
              >
                <Button
                  variant="outline"
                  className="flex-1 rounded-1 cursor-pointer transition-colors h-11 bg-muted/30 hover:bg-muted/50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
                  onClick={() => router.push('/liste-formateur')}
                >
                  إلغـــاء
                </Button>
                <Button
                  className="flex-1 rounded-1 bg-[#1071C7] hover:bg-[#0D5A9F] cursor-pointer transition-colors h-11"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "جاري المعالجة..." : "ســجــل"}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Animation */}
        {success && (
          <motion.div
            key="checkmark"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex justify-center mt-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
