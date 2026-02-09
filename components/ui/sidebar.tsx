"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Database,
  Users,
  Upload,
  Download,
  FileText,
  Network,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter, usePathname } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    setOpen(defaultOpen)
  }, [defaultOpen])

  useEffect(() => {
    // Sauvegarder l'état d'ouverture dans localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`sidebar-${title}`, JSON.stringify(open))
    }
  }, [open, title])

  useEffect(() => {
    // Restaurer l'état d'ouverture depuis localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`sidebar-${title}`)
      if (saved !== null) {
        setOpen(JSON.parse(saved))
      }
    }
  }, [title])

  return (
    <div className="mb-2">
      <button
        className="w-full flex items-center justify-between py-2 px-4 rounded-sm hover:bg-gray-100 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex gap-2 items-center">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 pl-4 border-l-2 border-gray-200">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Sidebar = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Déterminer l'élément sélectionné et si Database doit être ouvert en fonction de l'URL
  const getSelectedItemFromPath = (path: string) => {
    if (path.includes("/admin/database/liste-agents")) return "Agent"
    if (path.includes("/admin/database/liste-formations")) return "Formation"
    if (path.includes("/admin/database/liste-cours")) return "Cours"
    if (path.includes("/admin/database/liste-formateur")) return "Formateur"
    if (path.includes("/admin/database/formations-agent")) return "AgentFormation"
    if (path.includes("/admin/database/cours-formateur")) return "CoursFormateur"
    if (path.includes("/admin/auth-management/users")) return "Users"
    if (path.includes("/admin/auth-management/roles")) return "Roles"
    if (path.includes("/admin/auth-management/permissions")) return "Permissions"
    if (path.includes("/admin/auth-management/ui-components")) return "UI Components"
    if (path.includes("/admin/auth-management/gestion-users")) return "Gestion des users"
    if (path.includes("/admin/import-data")) return "Import data"
    if (path.includes("/admin/export-data")) return "Export data"
    if (path.includes("/admin/logs")) return "Logs"
    if (path.includes("/admin/connections")) return "Connections"
    return "Dashboard"
  }

  const shouldDatabaseBeOpen = (path: string) => {
    return path.includes("/admin/database/")
  }

  const shouldAuthBeOpen = (path: string) => {
    return path.includes("/admin/auth-management/")
  }

  const selectedItem = getSelectedItemFromPath(pathname)
  const databaseOpen = shouldDatabaseBeOpen(pathname)
  const authOpen = shouldAuthBeOpen(pathname)

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 bg-white text-black shadow">
      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src="/images/Logo1.png"
              alt="École Maritime Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-lg text-[#06407F]">École Maritime</p>
            <p className="text-sm text-gray-500">{session?.user?.email || "Non connecté"}</p>
          </div>
        </div>
      </div>
      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul>
          <li className="mb-2">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className={`flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-sm cursor-pointer ${
                selectedItem === "Dashboard" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
          </li>
          <CollapsibleSection title="Database" icon={<Database className="h-4 w-4" />} defaultOpen={databaseOpen}>
            <ul>
              <li>
                <button
                  onClick={() => router.push("/admin/database/liste-agents")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Agent" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Liste des Agents
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/database/liste-formations")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Formation" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Liste des Formations
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/database/liste-cours")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Cours" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Liste des Cours
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/database/liste-formateur")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Formateur" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Liste des Formateurs
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/database/formations-agent")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "AgentFormation" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Formations par Agent
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/database/cours-formateur")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "CoursFormateur" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Cours par Formateur
                </button>
              </li>
            </ul>
          </CollapsibleSection>
          <CollapsibleSection title="Auth Management" icon={<Users className="h-4 w-4" />} defaultOpen={authOpen}>
            <ul>
              <li>
                <button
                  onClick={() => router.push("/admin/auth-management/users")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Users" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/auth-management/roles")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Roles" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Roles
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/auth-management/permissions")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Permissions" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Permissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/auth-management/ui-components")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "UI Components" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Composants UI
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/admin/auth-management/gestion-users")}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Gestion des users" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Gestion des users
                </button>
              </li>
            </ul>
          </CollapsibleSection>
          <li className="mb-2">
            <button
              onClick={() => router.push("/admin/import-data")}
              className={`flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-sm cursor-pointer ${
                selectedItem === "Import data" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
              }`}
            >
              <Upload className="h-4 w-4" />
              Import data
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => router.push("/admin/export-data")}
              className={`flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-sm cursor-pointer ${
                selectedItem === "Export data" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
              }`}
            >
              <Download className="h-4 w-4" />
              Export data
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => router.push("/admin/logs")}
              className={`flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-sm cursor-pointer ${
                selectedItem === "Logs" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
              }`}
            >
              <FileText className="h-4 w-4" />
              Logs
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => router.push("/admin/connections")}
              className={`flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-sm cursor-pointer ${
                selectedItem === "Connections" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
              }`}
            >
              <Network className="h-4 w-4" />
              Connections
            </button>
          </li>
        </ul>
      </nav>
      {/* Footer / Action Button */}
      <div className="p-3.5 border-t border-gray-200">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center justify-left gap-2 text-[16px] p-2 text-red-600 font-semibold rounded-md hover:bg-red-100 cursor-pointer pl-4">
              <LogOut className="h-4.5 w-4.5 mr-6" />
              Logout
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation de déconnexion</AlertDialogTitle>
              <AlertDialogDescription className="py-3">
                Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-start cursor-pointer">
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                Se déconnecter
              </AlertDialogAction>
              <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export { Sidebar }
