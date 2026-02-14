import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
})

const notoNaskhArabic = localFont({
  src: "./fonts/NotoNaskhArabic.woff2",
  variable: "--font-noto-naskh-arabic",
})

export const metadata: Metadata = {
  title: "المدرسة البحرية المنستير",
  description: "المدرسة البحرية المنستير",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${notoNaskhArabic.variable} antialiased font-sans`} style={{ fontFamily: "var(--font-cairo)" }} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
