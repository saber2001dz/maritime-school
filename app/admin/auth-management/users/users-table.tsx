"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import * as XLSX from "xlsx"
import {
  Download,
  ChevronDown,
  Mail,
  User as UserIcon,
  Shield,
  Calendar,
  Edit,
  Trash2,
  Check,
  Search,
  UserPlus,
  Circle,
} from "lucide-react"
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
import { DialogueEditUser } from "./dialogue-edit-user"
import { DialogueAddUser } from "./dialogue-add-user"
import type { Role } from "@/lib/roles"
import { getRoleDisplayName, getRoleColor } from "@/lib/roles"

export interface User {
  id: string
  email: string
  name: string | null
  password: string
  role: string
  emailVerified: boolean
  createdAt: Date | string
  updatedAt: Date | string
  lastLogin?: Date | string | null
  hasActiveSession?: boolean
}

interface RoleWithCount extends Role {
  userCount: number
}

interface UsersTableProps {
  users?: User[]
  roles: RoleWithCount[]
  className?: string
  enableAnimations?: boolean
  onSaveEdit?: (user: User) => Promise<{ success: boolean; error?: string }>
  onDeleteUser?: (userId: string) => Promise<{ success: boolean; error?: string }>
  onAddUser?: (data: {
    email: string
    name: string
    password: string
    role: string
    emailVerified: boolean
  }) => Promise<{ success: boolean; error?: string }>
  onKillSession?: (userId: string) => Promise<{ success: boolean; error?: string }>
  isUpdating?: boolean
}

type SortField = "name" | "email" | "role" | "createdAt" | "updatedAt" | "lastLogin"
type SortOrder = "asc" | "desc"

export function UsersTable({
  users: initialUsers = [],
  roles,
  className = "",
  enableAnimations = true,
  onSaveEdit,
  onDeleteUser,
  onAddUser,
  onKillSession,
  isUpdating = false,
}: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showRoleFilter, setShowRoleFilter] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return []
      } else {
        return [userId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id))
    }
  }


  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setShowSortMenu(false)
    setCurrentPage(1)
  }

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = [...initialUsers]

    // Filtrer par recherche de nom/email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) => user.name?.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      )
    }

    // Filtrer par rôle
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (!sortField) {
      return filtered
    }

    const sorted = filtered.sort((a, b) => {
      let aVal: string | number | Date | null | undefined = a[sortField]
      let bVal: string | number | Date | null | undefined = b[sortField]

      // Gérer les valeurs null ou undefined
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      // Convertir les dates en timestamps pour la comparaison
      if (aVal instanceof Date) {
        aVal = aVal.getTime()
      } else if (sortField === "createdAt" || sortField === "updatedAt" || sortField === "lastLogin") {
        aVal = new Date(aVal as string).getTime()
      }

      if (bVal instanceof Date) {
        bVal = bVal.getTime()
      } else if (sortField === "createdAt" || sortField === "updatedAt" || sortField === "lastLogin") {
        bVal = new Date(bVal as string).getTime()
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [initialUsers, sortField, sortOrder, searchQuery, roleFilter])

  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedAndFilteredUsers.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [sortedAndFilteredUsers, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredUsers.length / ITEMS_PER_PAGE)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = ["Statut", "Nom", "Email", "Rôle", "Date d'inscription", "Dernière connexion"]
    const rows = sortedAndFilteredUsers.map((user: User) => [
      user.hasActiveSession ? "Online" : "Offline",
      user.name || "-",
      user.email,
      user.role,
      formatDate(user.createdAt),
      user.lastLogin ? formatDate(user.lastLogin) : "Jamais",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `users-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(sortedAndFilteredUsers, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `users-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const exportToExcel = () => {
    const excelData = sortedAndFilteredUsers.map((user: User) => ({
      "Statut": user.hasActiveSession ? "Online" : "Offline",
      "Nom": user.name || "-",
      "Email": user.email,
      "Rôle": getRoleDisplayName(user.role, roles),
      "Email vérifié": user.emailVerified ? "Oui" : "Non",
      "Date d'inscription": formatDate(user.createdAt),
      "Dernière connexion": user.lastLogin ? formatDate(user.lastLogin) : "Jamais",
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Utilisateurs")

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
      { wch: 18 },
      { wch: 14 },
      { wch: 20 },
      { wch: 20 },
    ]

    XLSX.writeFile(workbook, `users-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handleDeleteClick = (user: User) => {
    if (!selectedUsers.includes(user.id)) {
      return
    }
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      if (onDeleteUser) {
        const result = await onDeleteUser(userToDelete.id)

        if (result.success) {
          setSelectedUsers((prev) => prev.filter((id) => id !== userToDelete.id))
          setDeleteDialogOpen(false)
          setUserToDelete(null)
        } else {
          console.error("Erreur lors de la suppression:", result.error)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const handleEditClick = (user: User) => {
    if (!selectedUsers.includes(user.id)) {
      return
    }
    setUserToEdit(user)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async (data: Partial<User>) => {
    if (!userToEdit) return

    try {
      if (onSaveEdit) {
        const result = await onSaveEdit({
          ...userToEdit,
          ...data,
        } as User)

        if (result.success) {
          setEditDialogOpen(false)
          setUserToEdit(null)
        } else {
          console.error("Erreur lors de la modification:", result.error)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditDialogOpen(false)
    setUserToEdit(null)
  }

  const handleAddUser = async (data: {
    email: string
    name: string
    password: string
    role: string
    emailVerified: boolean
  }) => {
    if (!onAddUser) return

    try {
      const result = await onAddUser(data)

      if (result.success) {
        setAddDialogOpen(false)
      } else {
        console.error("Erreur lors de l'ajout:", result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      throw error
    }
  }

  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
  }

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border/50 text-foreground text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowRoleFilter(!showRoleFilter)}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
            >
              <Shield size={14} />
              Rôle
              {roleFilter && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">1</span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showRoleFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRoleFilter(false)} />
                <div className="absolute left-0 mt-1 w-56 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => {
                      setRoleFilter(null)
                      setShowRoleFilter(false)
                      setCurrentPage(1)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      !roleFilter ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Tous les rôles</span>
                    {!roleFilter && <Check size={14} className="text-primary" />}
                  </button>
                  <div className="h-px bg-border/30 my-1" />
                  {roles.map((role) => (
                    <button
                      key={role.name}
                      onClick={() => {
                        setRoleFilter(role.name)
                        setShowRoleFilter(false)
                        setCurrentPage(1)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                        roleFilter === role.name ? "bg-muted/30" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            role.color === "purple"
                              ? "bg-purple-500"
                              : role.color === "blue"
                              ? "bg-blue-500"
                              : role.color === "green"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                        {role.displayName}
                        <span className="text-xs text-muted-foreground">({role.userCount})</span>
                      </span>
                      {roleFilter === role.name && <Check size={14} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Trier{" "}
              {sortField && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">1</span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-1 w-52 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => {
                      setSortField(null)
                      setShowSortMenu(false)
                      setCurrentPage(1)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      !sortField ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Annuler le tri</span>
                    {!sortField && <Check size={14} className="text-primary" />}
                  </button>
                  <div className="h-px bg-border/30 my-1" />
                  <button
                    onClick={() => handleSort("name")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "name" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Nom {sortField === "name" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}</span>
                    {sortField === "name" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("email")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "email" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Email {sortField === "email" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}</span>
                    {sortField === "email" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("role")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "role" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Rôle {sortField === "role" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "role" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("createdAt")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "createdAt" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>Date création {sortField === "createdAt" && `(${sortOrder === "asc" ? "↑" : "↓"})`}</span>
                    {sortField === "createdAt" && <Check size={14} className="text-primary" />}
                  </button>
                  <button
                    onClick={() => handleSort("lastLogin")}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                      sortField === "lastLogin" ? "bg-muted/30" : ""
                    }`}
                  >
                    <span>
                      Dernière connexion {sortField === "lastLogin" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                    </span>
                    {sortField === "lastLogin" && <Check size={14} className="text-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md"
            >
              <Download size={14} />
              Exporter
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-background border border-border/50 shadow-lg rounded-md z-20">
                  <button
                    onClick={() => {
                      exportToExcel()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 border-t border-border/30"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 border-t border-border/30"
                  >
                    JSON
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setAddDialogOpen(true)}
            className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 rounded-full shadow-sm cursor-pointer"
            title="Ajouter un utilisateur"
          >
            <UserPlus size={16} />
          </button>
        </div>
      </div>

      <div className="bg-background border border-border overflow-hidden rounded-lg relative">
        <div className="overflow-x-auto">
          <div>
            <div
              className="px-3 py-3 text-xs font-semibold text-foreground border-b border-border text-left"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 120px 260px 1fr 180px 150px 120px 180px 180px 80px",
                columnGap: "0px",
                backgroundColor: "#F3F3F3",
              }}
            >
              <div className="flex items-center justify-center border-r border-border pr-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border/40 cursor-pointer"
                  style={
                    mounted
                      ? {
                          accentColor: isDark ? "rgb(113, 113, 122)" : "rgb(161, 161, 170)",
                        }
                      : {}
                  }
                  checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Circle className="w-3.5 h-3.5 opacity-50" />
                <span>Statut</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <UserIcon className="w-3.5 h-3.5 opacity-50" />
                <span>Nom</span>
                {sortField === "name" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Mail className="w-3.5 h-3.5 opacity-50" />
                <span>Email</span>
                {sortField === "email" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Shield className="w-3.5 h-3.5 opacity-50" />
                <span>Password</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Shield className="w-3.5 h-3.5 opacity-50" />
                <span>Rôle</span>
                {sortField === "role" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Check className="w-3.5 h-3.5 opacity-50" />
                <span>Email vérifié</span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Date d'inscription</span>
                {sortField === "createdAt" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center gap-1.5 border-r border-border px-3">
                <Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>Dernière connexion</span>
                {sortField === "lastLogin" && <ChevronDown className="w-3 h-3 opacity-40 ml-1" />}
              </div>
              <div className="flex items-center justify-center pl-3">
                <span>Actions</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}-sort-${sortField || "none"}-order-${sortOrder}-search-${searchQuery}-count-${
                  initialUsers.length
                }`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedUsers.map((user: User) => (
                  <motion.div key={user.id} variants={shouldAnimate ? rowVariants : {}}>
                    <div
                      className={`px-3 py-3.5 group relative transition-all duration-150 border-b border-border ${
                        selectedUsers.includes(user.id)
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "bg-muted/5 hover:bg-muted/20"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 120px 260px 1fr 180px 150px 120px 180px 180px 80px",
                        columnGap: "0px",
                        alignItems: "center",
                      }}
                    >
                      <div className="flex items-center justify-center border-r border-border pr-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border/40 cursor-pointer"
                          style={
                            mounted
                              ? {
                                  accentColor: isDark ? "rgb(113, 113, 122)" : "rgb(161, 161, 170)",
                                }
                              : {}
                          }
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                        />
                      </div>

                      <div className="flex items-center justify-center border-r border-border px-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                            user.hasActiveSession
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                          }`}
                        >
                          <Circle
                            className={`w-2 h-2 fill-current ${
                              user.hasActiveSession ? "text-green-500" : "text-gray-400"
                            }`}
                          />
                          {user.hasActiveSession ? "Online" : "Offline"}
                        </span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80 truncate">{user.name || "-"}</span>
                      </div>

                      <div className="flex items-center min-w-0 border-r border-border px-3">
                        <div className="text-sm text-foreground truncate">{user.email}</div>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-sm text-foreground/80 font-mono truncate">••••••••</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            getRoleColor(user.role, roles) === "purple"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              : getRoleColor(user.role, roles) === "blue"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : getRoleColor(user.role, roles) === "green"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                          }`}
                        >
                          {getRoleDisplayName(user.role, roles)}
                        </span>
                      </div>

                      <div className="flex items-center justify-center border-r border-border px-3">
                        <input
                          type="checkbox"
                          checked={user.emailVerified}
                          readOnly
                          className="w-4 h-4 rounded border-border/40 pointer-events-none"
                          style={
                            mounted
                              ? {
                                  accentColor: user.emailVerified
                                    ? isDark
                                      ? "rgb(34, 197, 94)"
                                      : "rgb(22, 163, 74)"
                                    : isDark
                                    ? "rgb(239, 68, 68)"
                                    : "rgb(220, 38, 38)",
                                }
                              : {}
                          }
                        />
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">{formatDate(user.createdAt)}</span>
                      </div>

                      <div className="flex items-center border-r border-border px-3">
                        <span className="text-xs text-foreground/70">
                          {user.lastLogin ? formatDate(user.lastLogin) : "Jamais"}
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2 pl-3">
                        <button
                          onClick={() => handleEditClick(user)}
                          disabled={!selectedUsers.includes(user.id)}
                          className="p-1.5 hover:bg-muted/50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Éditer"
                        >
                          <Edit size={14} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={!selectedUsers.includes(user.id)}
                          className="p-1.5 hover:bg-muted/50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70">
            Page {currentPage} sur {totalPages} • {sortedAndFilteredUsers.length} utilisateurs
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md cursor-pointer"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-background border border-border/50 text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-md cursor-pointer"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
            <AlertDialogDescription className="py-3" dir="ltr">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start cursor-pointer">
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              Supprimer
            </AlertDialogAction>
            <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DialogueEditUser
        key={userToEdit?.id}
        user={userToEdit}
        roles={roles}
        isOpen={editDialogOpen}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
        onKillSession={onKillSession}
      />

      <DialogueAddUser
        roles={roles}
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddUser}
      />
    </div>
  )
}
