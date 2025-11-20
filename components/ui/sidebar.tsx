"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  User,
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
import { useRouter } from "next/navigation"
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

const AnimatedMenuToggle = ({ toggle, isOpen }: { toggle: () => void; isOpen: boolean }) => (
  <button onClick={toggle} aria-label="Toggle menu" className="focus:outline-none z-999">
    <motion.div animate={{ y: isOpen ? 13 : 0 }} transition={{ duration: 0.3 }}>
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
        className="text-black"
      >
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 2.5 L 22 2.5" },
            open: { d: "M 3 16.5 L 17 2.5" },
          }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 12 L 22 12", opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="3"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 2 21.5 L 22 21.5" },
            open: { d: "M 3 2.5 L 17 16.5" },
          }}
        />
      </motion.svg>
    </motion.div>
  </button>
)

const CollapsibleSection = ({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) => {
  const [open, setOpen] = useState(false)

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
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState("Dashboard")
  const { data: session } = useSession()
  const router = useRouter()

  const toggleSidebar = () => setIsOpen(!isOpen)

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
              onClick={() => {
                setSelectedItem("Dashboard")
                router.push("/admin/dashboard")
              }}
              className={`flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-sm cursor-pointer ${
                selectedItem === "Dashboard" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
          </li>
          <CollapsibleSection title="Database" icon={<Database className="h-4 w-4" />}>
            <ul>
              <li>
                <button
                  onClick={() => {
                    setSelectedItem("Agent")
                    router.push("/admin/database/liste-agents")
                  }}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Agent" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Liste des Agents
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedItem("Formation")
                    router.push("/admin/database/liste-formations")
                  }}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "Formation" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Liste des Formations
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedItem("AgentFormation")
                    router.push("/admin/database/formations-agent")
                  }}
                  className={`w-full font-medium text-[13px] text-left p-2 rounded-sm cursor-pointer ${
                    selectedItem === "AgentFormation" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
                  }`}
                >
                  Formations par Agent
                </button>
              </li>
            </ul>
          </CollapsibleSection>
          <li className="mb-2">
            <button
              onClick={() => {
                setSelectedItem("User Management")
                router.push("/admin/user-management")
              }}
              className={`flex gap-2 font-medium text-sm items-center w-full py-2 px-4 rounded-sm cursor-pointer ${
                selectedItem === "User Management" ? "bg-[#EFF6FF] text-[#06407F]" : "hover:bg-gray-100"
              }`}
            >
              <Users className="h-4 w-4" />
              User Management
            </button>
          </li>
          <li className="mb-2">
            <button
              onClick={() => {
                setSelectedItem("Import data")
                router.push("/admin/import-data")
              }}
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
              onClick={() => {
                setSelectedItem("Export data")
                router.push("/admin/export-data")
              }}
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
              onClick={() => {
                setSelectedItem("Logs")
                router.push("/admin/logs")
              }}
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
              onClick={() => {
                setSelectedItem("Connections")
                router.push("/admin/connections")
              }}
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
