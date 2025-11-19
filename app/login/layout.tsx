"use client"
import { ToastProvider } from "@/components/ui/ultra-quality-toast"

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <div dir="ltr" className="min-h-screen">
        {children}
      </div>
    </ToastProvider>
  );
}
