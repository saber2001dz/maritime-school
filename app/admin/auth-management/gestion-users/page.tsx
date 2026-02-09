"use client"

import { useState, useMemo } from "react"
import {
  Users,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
  Settings,
} from "lucide-react"

// --- Types ---
interface MockUser {
  id: string
  name: string
  email: string
  role: string
  access: string
  status: "enabled" | "disabled"
  avatar: string
}

// --- Mock Data ---
const ROLES = [
  { name: "Super Admin", color: "#6366f1", bgColor: "#EEF2FF" },
  { name: "Manager", color: "#0891b2", bgColor: "#ECFEFF" },
  { name: "Accountant", color: "#059669", bgColor: "#ECFDF5" },
]

const MOCK_USERS: MockUser[] = [
  { id: "1", name: "Lila Thompson", email: "lila.thompson@gmail.com", role: "Super Admin", access: "Full Access", status: "enabled", avatar: "" },
  { id: "2", name: "Mia Johnson", email: "mia.johnson.work@gmail.com", role: "Super Admin", access: "Full Access", status: "enabled", avatar: "" },
  { id: "3", name: "Olivia Brown", email: "olivia.brown.mail@gmail.com", role: "Super Admin", access: "Read-Only", status: "disabled", avatar: "" },
  { id: "4", name: "Chloe Anderson", email: "chloe.anderson93@gmail.com", role: "Manager", access: "Full Access", status: "enabled", avatar: "" },
  { id: "5", name: "Ella Robinson", email: "ella.robinson22@gmail.com", role: "Manager", access: "Full Access", status: "enabled", avatar: "" },
  { id: "6", name: "Grace Hall", email: "grace.hall.inbox@gmail.com", role: "Manager", access: "Limited Admin", status: "disabled", avatar: "" },
  { id: "7", name: "Ava Martinez", email: "ava.martinez.dev@gmail.com", role: "Accountant", access: "Full Access", status: "enabled", avatar: "" },
  { id: "8", name: "Isabella Garcia", email: "ava.martinez.dev@gmail.com", role: "Accountant", access: "Full Access", status: "enabled", avatar: "" },
  { id: "9", name: "Sofia Lee", email: "sofia.project@gmail.com", role: "Accountant", access: "Full Access", status: "disabled", avatar: "" },
  { id: "10", name: "Mira Yilmaz", email: "mira.yilmaz@clarionlabs.io", role: "Super Admin", access: "Read-Only", status: "enabled", avatar: "" },
  { id: "11", name: "Ethan Brooks", email: "ethan.brooks@eventures.com", role: "Super Admin", access: "Full Access", status: "enabled", avatar: "" },
  { id: "12", name: "Jin Park", email: "jin.park@zenlogix.co", role: "Manager", access: "Limited Admin", status: "enabled", avatar: "" },
  { id: "13", name: "Liu Zhang", email: "liu.zhang@transysglobal.com", role: "Accountant", access: "Full Access", status: "disabled", avatar: "" },
  { id: "14", name: "Tao Li", email: "tao.li@skychaintech.com", role: "Super Admin", access: "Full Access", status: "disabled", avatar: "" },
  { id: "15", name: "Sophie Klein", email: "sophie.klein@brighmedia.com", role: "Accountant", access: "Full Access", status: "enabled", avatar: "" },
  { id: "16", name: "Emma Wilson", email: "emma.wilson@promail.com", role: "Manager", access: "Full Access", status: "enabled", avatar: "" },
  { id: "17", name: "Noah Davis", email: "noah.davis@techinc.com", role: "Super Admin", access: "Full Access", status: "enabled", avatar: "" },
  { id: "18", name: "Liam Carter", email: "liam.carter@devhub.io", role: "Accountant", access: "Read-Only", status: "enabled", avatar: "" },
  { id: "19", name: "Zara Ahmed", email: "zara.ahmed@globalnet.co", role: "Manager", access: "Full Access", status: "enabled", avatar: "" },
]

// --- Avatar component with initials ---
function UserAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Generate a consistent color from the name
  const colors = [
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#ef4444", "#f97316",
    "#eab308", "#84cc16", "#22c55e", "#14b8a6",
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  ]
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  )
}

// --- Status Badge ---
function StatusBadge({ status }: { status: "enabled" | "disabled" }) {
  if (status === "enabled") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        Enabled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200">
      Disabled
    </span>
  )
}

// --- Role Card (top section) ---
function RoleCard({
  roleName,
  users,
}: {
  roleName: string
  users: MockUser[]
}) {
  const displayedUsers = users.slice(0, 3)

  return (
    <div className="border border-gray-200 rounded-md p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-md text-gray-900">{roleName}</h3>
        <button className="text-xs text-gray-600 hover:text-gray-700 border border-gray-200 rounded-sm px-2.5 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer">
          See All
        </button>
      </div>

      {/* Users list */}
      <div className="flex flex-col gap-5 flex-1">
        {displayedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar name={user.name} size={36} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <StatusBadge status={user.status} />
          </div>
        ))}
      </div>

      {/* Manage button */}
      <button className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors cursor-pointer">
        <Settings className="h-4 w-4" />
        Manage
      </button>
    </div>
  )
}

// --- Main Page ---
export default function GestionUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("All")
  const [sortOpen, setSortOpen] = useState(false)

  // Group users by role for top cards
  const usersByRole = useMemo(() => {
    const grouped: Record<string, MockUser[]> = {}
    for (const role of ROLES) {
      grouped[role.name] = MOCK_USERS.filter((u) => u.role === role.name)
    }
    return grouped
  }, [])

  // Count per role for tabs
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { All: MOCK_USERS.length }
    for (const role of ROLES) {
      counts[role.name] = MOCK_USERS.filter((u) => u.role === role.name).length
    }
    return counts
  }, [])

  // Filter users for table
  const filteredUsers = useMemo(() => {
    let users = MOCK_USERS
    if (activeTab !== "All") {
      users = users.filter((u) => u.role === activeTab)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      )
    }
    return users
  }, [activeTab, searchQuery])

  const tabs = ["All", ...ROLES.map((r) => r.name)]

  return (
    <div className="p-6 md:p-8 full-width">
      {/* ===== ADMINISTRATORS SECTION ===== */}
      <div className="mb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-gray-700" />
            <h1 className="text-lg font-bold text-gray-900">Administrators</h1>
          </div>
          <button className="inline-flex items-center gap-1.5 px-8 py-2 rounded-md text-sm font-semibold text-white bg-linear-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-sm transition-all cursor-pointer">
            Add User
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6 ml-7">
          Access is based on role: {ROLES.map((r) => r.name).join(", ")}. Each role unlocks specific menus and features.
        </p>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map((role) => (
            <RoleCard
              key={role.name}
              roleName={role.name}
              users={usersByRole[role.name] || []}
            />
          ))}
        </div>
      </div>

      {/* ===== ADMINISTRATOR ACCOUNTS TABLE SECTION ===== */}
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <Users className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">Administrator Accounts</h2>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:ring-0.5 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Sort & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Sort by
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {["Name", "Email", "Role", "Status"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSortOpen(false)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="inline-flex items-center justify-center w-9 h-9 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer">
              <SlidersHorizontal className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab} ({roleCounts[tab] ?? 0})
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Access
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} size={36} />
                      <span className="text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {user.role}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.access}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
