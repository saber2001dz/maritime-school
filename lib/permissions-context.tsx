"use client"

import { createContext, useContext } from "react"
import type { PermissionsMap } from "./permissions"

const PermissionsContext = createContext<PermissionsMap>({})

export function PermissionsProvider({
  children,
  permissionsMap,
}: {
  children: React.ReactNode
  permissionsMap: PermissionsMap
}) {
  return (
    <PermissionsContext.Provider value={permissionsMap}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions(): PermissionsMap {
  return useContext(PermissionsContext)
}
