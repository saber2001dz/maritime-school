"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/20/solid"

type ToastVariant = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((arr) => arr.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ title, description, variant, duration = 4000 }: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setToasts((arr) => [...arr, { id, title, description, variant, duration }])
      setTimeout(() => removeToast(id), duration)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 space-y-2" style={{ zIndex: 9999 }}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function variantStyles(variant: ToastVariant, isRTL: boolean) {
  const borderClass = isRTL ? "border-r-4" : "border-l-4"

  switch (variant) {
    case "success":
      return `bg-green-50 ${borderClass} border-green-400 text-green-800`
    case "error":
      return `bg-red-50 ${borderClass} border-red-400 text-red-800`
    case "warning":
      return `bg-yellow-50 ${borderClass} border-yellow-400 text-yellow-800`
    case "info":
    default:
      return `bg-blue-50 ${borderClass} border-blue-400 text-blue-800`
  }
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isRTL, setIsRTL] = React.useState(false)
  const toastRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Détecter la direction en remontant l'arbre DOM
    if (toastRef.current) {
      let element: HTMLElement | null = toastRef.current
      while (element) {
        const dir = element.getAttribute('dir')
        if (dir === 'rtl' || dir === 'ltr') {
          setIsRTL(dir === 'rtl')
          return
        }
        element = element.parentElement
      }
    }
    // Fallback sur le document
    const dir = document.documentElement.dir || document.body.dir
    setIsRTL(dir === "rtl")
  }, [])

  const marginClass = isRTL ? "mr-4" : "ml-4"

  return (
    <Transition
      appear
      show
      as={React.Fragment}
      enter="transform transition duration-200"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transform transition duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
    >
      <div
        ref={toastRef}
        className={`w-100 ${variantStyles(toast.variant, isRTL)} shadow-lg rounded p-4 flex`}
        role="alert"
        aria-live="assertive"
        style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
      >
        <div className="flex-1 text-start">
          <p className="font-bold">{toast.title}</p>
          {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
        </div>
        <button
          onClick={onClose}
          className={`${marginClass} text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer`}
          aria-label="Close notification"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </Transition>
  )
}
