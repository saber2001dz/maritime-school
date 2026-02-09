import { Header } from "@/components/ui/header"
import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { ToastProvider } from "@/components/ui/ultra-quality-toast"
import { PermissionsProvider } from "@/lib/permissions-context"
import { loadPermissions } from "@/lib/permissions-server"

export default async function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérifier l'authentification pour toutes les pages sous (with-header)
  const session = await verifySession()
  if (!session.isAuth) {
    redirect('/login')
  }

  const permissionsMap = await loadPermissions()

  return (
    <PermissionsProvider permissionsMap={permissionsMap}>
      <ToastProvider>
        <Header userRole={session.role} />
        {children}
      </ToastProvider>
    </PermissionsProvider>
  )
}
