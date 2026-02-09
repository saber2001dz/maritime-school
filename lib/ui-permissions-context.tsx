"use client"

/**
 * UI Permissions Context - Client Only
 *
 * Provider et hook pour accéder aux permissions UI côté client
 */

import { createContext, useContext } from 'react'
import type { UIPermissionsMap } from './ui-permissions'

const UIPermissionsContext = createContext<UIPermissionsMap>({})

interface UIPermissionsProviderProps {
  uiPermissionsMap: UIPermissionsMap
  children: React.ReactNode
}

/**
 * Provider pour les permissions UI
 * À utiliser dans le layout principal pour fournir la map à tous les composants enfants
 *
 * @example
 * ```typescript
 * // Dans app/(with-header)/layout.tsx
 * import { loadUIPermissions } from '@/lib/ui-permissions-server'
 * import { UIPermissionsProvider } from '@/lib/ui-permissions-context'
 *
 * export default async function Layout({ children }) {
 *   const uiPermissionsMap = await loadUIPermissions()
 *
 *   return (
 *     <UIPermissionsProvider uiPermissionsMap={uiPermissionsMap}>
 *       {children}
 *     </UIPermissionsProvider>
 *   )
 * }
 * ```
 */
export function UIPermissionsProvider({ uiPermissionsMap, children }: UIPermissionsProviderProps) {
  return (
    <UIPermissionsContext.Provider value={uiPermissionsMap}>
      {children}
    </UIPermissionsContext.Provider>
  )
}

/**
 * Hook pour accéder à la map des permissions UI dans les composants clients
 *
 * @returns UIPermissionsMap
 *
 * @example
 * ```typescript
 * // Dans un Client Component
 * import { useUIPermissions } from '@/lib/ui-permissions-context'
 * import { canAccessUIComponent } from '@/lib/ui-permissions'
 *
 * export function MyComponent({ userRoleId }) {
 *   const uiPermissionsMap = useUIPermissions()
 *
 *   const canExport = canAccessUIComponent(userRoleId, "agent_export_excel", uiPermissionsMap)
 *
 *   return (
 *     <>
 *       {canExport && <Button>Export Excel</Button>}
 *     </>
 *   )
 * }
 * ```
 */
export function useUIPermissions(): UIPermissionsMap {
  const context = useContext(UIPermissionsContext)

  if (context === undefined) {
    throw new Error('useUIPermissions must be used within a UIPermissionsProvider')
  }

  return context
}
