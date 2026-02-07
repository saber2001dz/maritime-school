"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import localFont from "next/font/local";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const notoNaskhArabic = localFont({
  src: "../app/fonts/NotoNaskhArabic.woff2",
  display: "swap",
});

export interface SessionAgentData {
  nomPrenom: string;
  grade: string;
  matricule: string;
}

interface DialogueEditionSessionAgentProps {
  sessionInfo: {
    reference: string;
    formation: string;
  };
  agentData: SessionAgentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SessionAgentData) => void;
  onDelete?: () => void;
  onChange: (field: string, value: string) => void;
  isUpdating: boolean;
  error?: string;
}

export default function DialogueEditionSessionAgent({
  sessionInfo,
  agentData,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onChange,
  isUpdating,
  error,
}: DialogueEditionSessionAgentProps) {
  const [localData, setLocalData] = useState<SessionAgentData | null>(null);

  useEffect(() => {
    if (agentData) {
      setLocalData(agentData);
    }
  }, [agentData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localData) {
      onSave(localData);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (localData) {
      const newData = { ...localData, [field]: value };
      setLocalData(newData);
      onChange(field, value);
    }
  };

  if (!isOpen || !localData) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div
          className="bg-background border border-border rounded-lg shadow-lg w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className={`text-lg font-semibold ${notoNaskhArabic.className}`}>
              تعديل بيانات العون
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Session Info */}
              <div className="bg-muted/30 p-4 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${notoNaskhArabic.className}`}>
                    التكوين:
                  </span>
                  <span className={`text-sm text-foreground/70 ${notoNaskhArabic.className}`}>
                    {sessionInfo.formation}
                  </span>
                </div>
                {sessionInfo.reference && (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${notoNaskhArabic.className}`}>
                      المرجع:
                    </span>
                    <span className={`text-sm text-foreground/70 ${notoNaskhArabic.className}`}>
                      {sessionInfo.reference}
                    </span>
                  </div>
                )}
              </div>

              {/* Nom et Prénom (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="nomPrenom" className={notoNaskhArabic.className}>
                  الإسم و اللقب
                </Label>
                <Input
                  id="nomPrenom"
                  type="text"
                  value={localData.nomPrenom}
                  className={`text-right ${notoNaskhArabic.className} bg-muted/30`}
                  dir="rtl"
                  disabled
                  readOnly
                />
              </div>

              {/* Grade (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="grade" className={notoNaskhArabic.className}>
                  الرتبــة
                </Label>
                <Input
                  id="grade"
                  type="text"
                  value={localData.grade}
                  className={`text-right ${notoNaskhArabic.className} bg-muted/30`}
                  dir="rtl"
                  disabled
                  readOnly
                />
              </div>

              {/* Matricule (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="matricule" className={notoNaskhArabic.className}>
                  الــرقـــم
                </Label>
                <Input
                  id="matricule"
                  type="text"
                  value={localData.matricule}
                  className={`text-right ${notoNaskhArabic.className} bg-muted/30`}
                  dir="rtl"
                  disabled
                  readOnly
                />
              </div>

              {/* Note explicative */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
                <p className={`text-xs text-blue-700 dark:text-blue-300 ${notoNaskhArabic.className}`}>
                  ملاحظة: بيانات العون (الإسم، الرتبة، الرقم) للقراءة فقط. لتعديلها، يرجى الانتقال إلى صفحة قائمة الأعوان.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <div>
                {onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                    disabled={isUpdating}
                    className={notoNaskhArabic.className}
                  >
                    {isUpdating ? "جاري الحذف..." : "إزالة من الجلسة"}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isUpdating}
                  className={notoNaskhArabic.className}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
