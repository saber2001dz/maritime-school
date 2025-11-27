"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen" dir="ltr">
        <p>Chargement . . .</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div dir="ltr" className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
