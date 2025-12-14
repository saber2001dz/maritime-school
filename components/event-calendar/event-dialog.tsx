"use client"

import { useEffect, useState } from "react"
import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react"
import { isBefore } from "date-fns"
import localFont from "next/font/local"

import { cn } from "@/lib/utils"
import { formatDateInArabic, customArLocale } from "@/lib/calendar-locale"

const notoNaskhArabic = localFont({
  src: "../../app/fonts/NotoNaskhArabic.woff2",
  variable: "--font-noto-naskh-arabic",
})
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CalendarEvent, EventColor } from "@/components/event-calendar"
import {
  DefaultEndHour,
  DefaultStartHour,
} from "@/components/event-calendar/constants"

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  formations?: Array<{ id: string; formation: string }>
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  formations = [],
}: EventDialogProps) {
  const [formationId, setFormationId] = useState("")
  const [reference, setReference] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [nombreParticipants, setNombreParticipants] = useState(0)
  const [color, setColor] = useState<EventColor>("sky")
  const [error, setError] = useState<string | null>(null)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (event) {
      setFormationId(event.formationId || "")
      setReference(event.reference || "")

      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartDate(start)
      setEndDate(end)
      setNombreParticipants(event.nombreParticipants || 0)
      setColor((event.color as EventColor) || "sky")
      setError(null) // Reset error when opening dialog
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setFormationId("")
    setReference("")
    setStartDate(new Date())
    setEndDate(new Date())
    setNombreParticipants(0)
    setColor("sky")
    setError(null)
  }

  const handleSave = () => {
    // Use default hours (8:00 AM - 5:00 PM)
    const startHours = DefaultStartHour
    const startMinutes = 0
    const endHours = DefaultEndHour
    const endMinutes = 0

    // Create Date objects with proper timezone handling
    // These dates will be in local time and will be converted to UTC by the API
    const start = new Date(startDate)
    start.setHours(startHours, startMinutes, 0, 0)

    const end = new Date(endDate)
    end.setHours(endHours, endMinutes, 0, 0)

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("لا يمكن أن يكون تاريخ النهاية قبل تاريخ البداية")
      return
    }

    // Validate formation selection
    if (!formationId) {
      setError("يجب اختيار دورة تكوينية")
      return
    }

    // Get formation title
    const selectedFormation = formations.find(f => f.id === formationId)
    const eventTitle = selectedFormation?.formation || "(بدون عنوان)"

    onSave({
      id: event?.id || "",
      title: eventTitle,
      description: "", // Keep for future use
      start,
      end,
      allDay: false,
      location: "",
      color,
      formationId,
      nombreParticipants,
      reference,
    })
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (event?.id) {
      onDelete(event.id)
      setShowDeleteConfirm(false)
    }
  }

  // Updated color options to match types.ts
  const colorOptions: Array<{
    value: EventColor
    label: string
    bgClass: string
    borderClass: string
  }> = [
    {
      value: "sky",
      label: "سماوي",
      bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
      borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
    },
    {
      value: "amber",
      label: "عنبر",
      bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
      borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
    },
    {
      value: "violet",
      label: "بنفسجي",
      bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
      borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
    },
    {
      value: "rose",
      label: "وردي",
      bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
      borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
    },
    {
      value: "emerald",
      label: "زمردي",
      bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
      borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
    },
    {
      value: "orange",
      label: "برتقالي",
      bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
      borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
    },
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className={`sm:max-w-[425px] ${notoNaskhArabic.variable}`} style={{ fontFamily: "var(--font-noto-naskh-arabic)" }} dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-start font-bold text-[#1071c7]">{event?.id ? "تعديل الــدورة" : "إنشاء الــدورة"}</DialogTitle>
            <DialogDescription className="sr-only">
              {event?.id
                ? "تعديل تفاصيل هذه الــدورة"
                : "إضافة دورة جديدة إلى البرنامج"}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="formation">الــدورة التكــوينيـــة</Label>
              <Select dir="rtl" value={formationId} onValueChange={setFormationId}>
                <SelectTrigger id="formation" dir="rtl" className="w-full" style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
                  <SelectValue placeholder="اختر دورة تكوينية" />
                </SelectTrigger>
                <SelectContent style={{ fontFamily: "var(--font-noto-naskh-arabic)" }}>
                  {formations.map((formation) => (
                    <SelectItem key={formation.id} value={formation.id}>
                      {formation.formation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="reference">المـــرجــــع</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="أدخل المرجع"
              />
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="start-date">تاريخ البداية</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? formatDateInArabic(startDate) : "اختر التاريخ"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    locale={customArLocale}
                    dir="rtl"
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date)
                        // If end date is before the new start date, update it to match the start date
                        if (isBefore(endDate, date)) {
                          setEndDate(date)
                        }
                        setError(null)
                        setStartDateOpen(false)
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="end-date">تاريخ النهاية</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? formatDateInArabic(endDate) : "اختر التاريخ"}
                    </span>
                    <RiCalendarLine
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    defaultMonth={endDate}
                    disabled={{ before: startDate }}
                    locale={customArLocale}
                    dir="rtl"
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date)
                        setError(null)
                        setEndDateOpen(false)
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="nombreParticipants">عــدد المشاركــيــن</Label>
              <Input
                id="nombreParticipants"
                type="number"
                min="0"
                value={nombreParticipants}
                onChange={(e) => setNombreParticipants(parseInt(e.target.value) || 0)}
              />
            </div>
            <fieldset className="space-y-4">
              <legend className="text-foreground text-sm leading-none font-medium">
                اللــــون
              </legend>
              <RadioGroup
                className="flex gap-1.5 justify-end"
                defaultValue={colorOptions[0]?.value}
                value={color}
                onValueChange={(value: EventColor) => setColor(value)}
              >
                {colorOptions.map((colorOption) => (
                  <RadioGroupItem
                    key={colorOption.value}
                    id={`color-${colorOption.value}`}
                    value={colorOption.value}
                    aria-label={colorOption.label}
                    className={cn(
                      "size-6 shadow-none",
                      colorOption.bgClass,
                      colorOption.borderClass
                    )}
                  />
                ))}
              </RadioGroup>
            </fieldset>
          </div>
          <DialogFooter className="flex-row sm:justify-between">
            {event?.id && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleDeleteClick}
                aria-label="حذف الحدث"
              >
                <RiDeleteBinLine size={16} aria-hidden="true" />
              </Button>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                إلغــــاء
              </Button>
              <Button onClick={handleSave}>حــفــــظ</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className={notoNaskhArabic.variable} style={{ fontFamily: "var(--font-noto-naskh-arabic)" }} dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد الحـــذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغــــاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حــــذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
