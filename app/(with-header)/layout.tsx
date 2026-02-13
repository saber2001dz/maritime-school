import { Header } from "@/components/ui/header"
import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import { ToastProvider } from "@/components/ui/ultra-quality-toast"
import { PermissionsProvider } from "@/lib/permissions-context"
import { loadPermissions } from "@/lib/permissions-server"
import { UIPermissionsProvider } from "@/lib/ui-permissions-context"
import { loadUIPermissions } from "@/lib/ui-permissions-server"
import { prisma } from "@/lib/db"

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

  const [permissionsMap, uiPermissionsMap] = await Promise.all([
    loadPermissions(),
    loadUIPermissions(),
  ])

  // Récupérer l'ID du rôle depuis la DB pour les UI permissions
  let userRoleId: string | null = null
  if (session.role) {
    const role = await prisma.role.findUnique({ where: { name: session.role } })
    userRoleId = role?.id ?? null
  }

  return (
    <PermissionsProvider permissionsMap={permissionsMap}>
      <UIPermissionsProvider uiPermissionsMap={uiPermissionsMap}>
        <ToastProvider>
          <Header userRole={session.role} userRoleId={userRoleId} />
          {children}
        </ToastProvider>
      </UIPermissionsProvider>
    </PermissionsProvider>
  )
}
