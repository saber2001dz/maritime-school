"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Download, ChevronDown, Search, X, SearchX, Eye } from "lucide-react"
import { Resizable } from "react-resizable"
import { Input } from "@/components/ui/input"
import "react-resizable/css/styles.css"

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  salary: number
  hireDate: string
  status: "active" | "inactive" | "on-leave"
  avatar?: string
}

interface ResizableTableProps {
  title?: string
  employees?: Employee[]
  onEmployeeSelect?: (employeeId: string) => void
  onColumnResize?: (columnKey: string, newWidth: number) => void
  className?: string
  enableAnimations?: boolean
}

const defaultEmployees: Employee[] = [
  {
    id: "1",
    name: "أحمد بن محمد",
    email: "مقدم",
    department: "12345",
    position: "مهندس برمجيات أول",
    salary: 55123456,
    hireDate: "2022-03-15",
    status: "active",
  },
  {
    id: "2",
    name: "فاطمة الزهراء",
    email: "رائد",
    department: "23456",
    position: "مدير التسويق",
    salary: 55234567,
    hireDate: "2021-08-22",
    status: "active",
  },
  {
    id: "3",
    name: "محمد الأمين",
    email: "عريف أول",
    department: "34567",
    position: "مصمم تجربة المستخدم",
    salary: 55345678,
    hireDate: "2023-01-10",
    status: "active",
  },
  {
    id: "4",
    name: "خديجة بنت علي",
    email: "عريف",
    department: "45678",
    position: "قائد تقني",
    salary: 55456789,
    hireDate: "2020-11-05",
    status: "active",
  },
  {
    id: "5",
    name: "عبد الرحمن السعيد",
    email: "ملازم أول",
    department: "56789",
    position: "مدير الموارد البشرية",
    salary: 55567890,
    hireDate: "2019-06-12",
    status: "on-leave",
  },
  {
    id: "6",
    name: "نور الهدى",
    email: "وكيل",
    department: "67890",
    position: "مدير المبيعات",
    salary: 55678901,
    hireDate: "2021-02-28",
    status: "active",
  },
  {
    id: "7",
    name: "يوسف بن إبراهيم",
    email: "وكيل أول",
    department: "78901",
    position: "محلل مالي",
    salary: 55789012,
    hireDate: "2023-04-18",
    status: "active",
  },
  {
    id: "8",
    name: "سارة القاسمي",
    email: "وكيل",
    department: "89012",
    position: "مهندس عمليات التطوير",
    salary: 55890123,
    hireDate: "2022-09-14",
    status: "active",
  },
  {
    id: "9",
    name: "عمر بن الخطاب",
    email: "عريف أول",
    department: "90123",
    position: "مدير المحتوى",
    salary: 55901234,
    hireDate: "2023-07-03",
    status: "inactive",
  },
  {
    id: "10",
    name: "ليلى المنصوري",
    email: "عريف",
    department: "10234",
    position: "مدير العمليات",
    salary: 56012345,
    hireDate: "2021-12-01",
    status: "active",
  },
  {
    id: "11",
    name: "حسن البصري",
    email: "وكيل",
    department: "11345",
    position: "مصمم منتجات",
    salary: 56123456,
    hireDate: "2022-05-20",
    status: "active",
  },
  {
    id: "12",
    name: "مريم العلوي",
    email: "وكيل أول",
    department: "12456",
    position: "مطور واجهات أمامية",
    salary: 56234567,
    hireDate: "2023-03-08",
    status: "active",
  },
  {
    id: "13",
    name: "زياد الحسني",
    email: "وكيل أول",
    department: "13567",
    position: "مسؤول حسابات",
    salary: 56345678,
    hireDate: "2022-11-15",
    status: "active",
  },
  {
    id: "14",
    name: "إلهام الشريف",
    email: "ملازم أول",
    department: "14678",
    position: "محلل مالي أول",
    salary: 56456789,
    hireDate: "2021-04-30",
    status: "active",
  },
  {
    id: "15",
    name: "طارق بن زياد",
    email: "نقيب",
    department: "15789",
    position: "أخصائي موارد بشرية",
    salary: 56567890,
    hireDate: "2023-08-12",
    status: "active",
  },
]

type SortField = "name" | "department" | "position" | "salary" | "hireDate"
type SortOrder = "asc" | "desc"

export function ResizableTable({
  title = "Employee",
  employees: initialEmployees = defaultEmployees,
  onEmployeeSelect,
  onColumnResize,
  className = "",
  enableAnimations = true,
}: ResizableTableProps = {}) {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const shouldReduceMotion = useReducedMotion()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Column width state with default values
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    checkbox: 60,
    name: 206, // Increased for name (الإسم و اللقب)
    email: 116, // Reduced for rank (الرتبة)
    department: 120, // Reduced for department (الرقم)
    position: 240, // Increased for position (المسؤولية)
    salary: 136, // +6 pixels
    hireDate: 156, // +6 pixels
    status: 136, // Reduced by 30 pixels (166 - 30 = 136)
    actions: 138, // +30 pixels (108 + 30 = 138)
  })

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId)
      } else {
        return [...prev, employeeId]
      }
    })
    if (onEmployeeSelect) {
      onEmployeeSelect(employeeId)
    }
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === paginatedEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(paginatedEmployees.map((e) => e.id))
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

  const handleFilter = (status: string | null) => {
    setFilterStatus(status)
    setShowFilterMenu(false)
    setCurrentPage(1)
  }

  const sortedAndFilteredEmployees = useMemo(() => {
    let filtered = [...initialEmployees]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((e) => e.status === filterStatus)
    }

    // Sort
    if (!sortField) {
      return filtered
    }

    return filtered.sort((a, b) => {
      let aVal: string | number = a[sortField]
      let bVal: string | number = b[sortField]

      if (sortField === "hireDate") {
        aVal = new Date(a.hireDate).getTime()
        bVal = new Date(b.hireDate).getTime()
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [initialEmployees, sortField, sortOrder, filterStatus, searchQuery])

  const paginatedEmployees = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedAndFilteredEmployees.slice(startIdx, startIdx + ITEMS_PER_PAGE)
  }, [sortedAndFilteredEmployees, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredEmployees.length / ITEMS_PER_PAGE)

  const getStatusColor = (status: string) => {
    if (!mounted) {
      const statusMap: Record<string, { bgColor: string; borderColor: string; textColor: string; dotColor: string }> = {
        active: {
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          textColor: "text-green-400",
          dotColor: "bg-green-400",
        },
        inactive: {
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          textColor: "text-red-400",
          dotColor: "bg-red-400",
        },
        "on-leave": {
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          textColor: "text-yellow-400",
          dotColor: "bg-yellow-400",
        },
      }
      return statusMap[status]
    }

    const statusMap: Record<string, { bgColor: string; borderColor: string; textColor: string; dotColor: string }> = {
      active: {
        bgColor: isDark ? "bg-green-500/10" : "bg-green-50",
        borderColor: isDark ? "border-green-500/30" : "border-green-200",
        textColor: isDark ? "text-green-400" : "text-green-600",
        dotColor: isDark ? "bg-green-400" : "bg-green-600",
      },
      inactive: {
        bgColor: isDark ? "bg-red-500/10" : "bg-red-50",
        borderColor: isDark ? "border-red-500/30" : "border-red-200",
        textColor: isDark ? "text-red-400" : "text-red-600",
        dotColor: isDark ? "bg-red-400" : "bg-red-600",
      },
      "on-leave": {
        bgColor: isDark ? "bg-yellow-500/10" : "bg-yellow-50",
        borderColor: isDark ? "border-yellow-500/30" : "border-yellow-200",
        textColor: isDark ? "text-yellow-400" : "text-yellow-600",
        dotColor: isDark ? "bg-yellow-400" : "bg-yellow-600",
      },
    }

    return statusMap[status]
  }

  const formatPhoneNumber = (phone: number) => {
    const phoneStr = phone.toString()
    // Format: XX XXX XXX
    if (phoneStr.length === 8) {
      return `${phoneStr.slice(0, 2)} ${phoneStr.slice(2, 5)} ${phoneStr.slice(5, 8)}`
    }
    return phoneStr
  }

  const handleResize = (columnKey: string, _event: any, { size }: any) => {
    // In RTL mode, we need to invert the width calculation
    // Instead of using size.width directly, calculate the delta and invert it
    const currentWidth = columnWidths[columnKey]
    const delta = size.width - currentWidth
    const newWidth = Math.max(80, Math.min(400, currentWidth - delta)) // Invert delta for RTL

    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: newWidth,
    }))

    if (onColumnResize) {
      onColumnResize(columnKey, newWidth)
    }
  }

  const exportToCSV = () => {
    // Headers in RTL order (right to left)
    const headers = ["الفئة", "آخر تكوين", "رقم الهاتف", "المسؤولية", "الرقم", "الرتبة", "الإسم و اللقب"]
    const rows = sortedAndFilteredEmployees.map((employee) => [
      employee.status,
      employee.hireDate,
      employee.salary,
      employee.position,
      employee.department,
      employee.email,
      employee.name,
    ])

    // Add BOM for proper UTF-8 encoding and RTL mark
    const BOM = "\uFEFF"
    const RTL_MARK = "\u200F" // Right-to-left mark
    const csvContent = [
      RTL_MARK + headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${RTL_MARK}${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `employees-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(sortedAndFilteredEmployees, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `employees-${new Date().toISOString().split("T")[0]}.json`
    link.click()
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
  } as const

  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="بــحــث حــســب الهــويــة . . ."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pr-9 pl-9 focus-visible:ring-1"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
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
              ترتــيــب{" "}
              {sortField && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">1</span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => handleSort("name")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "name" ? "bg-muted/30" : ""
                    }`}
                  >
                    Name {sortField === "name" && `(${sortOrder === "asc" ? "A-Z" : "Z-A"})`}
                  </button>
                  <button
                    onClick={() => handleSort("department")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "department" ? "bg-muted/30" : ""
                    }`}
                  >
                    Department {sortField === "department" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("salary")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "salary" ? "bg-muted/30" : ""
                    }`}
                  >
                    Salary {sortField === "salary" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                  <button
                    onClick={() => handleSort("hireDate")}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors ${
                      sortField === "hireDate" ? "bg-muted/30" : ""
                    }`}
                  >
                    Hire Date {sortField === "hireDate" && `(${sortOrder === "asc" ? "↑" : "↓"})`}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer ${
                filterStatus ? "ring-2 ring-primary/30" : ""
              }`}
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 3H14M4 8H12M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              تـصـفـيـة
              {filterStatus && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">1</span>
              )}
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-background border border-border/50 shadow-lg rounded-md z-20 py-1">
                  <button
                    onClick={() => handleFilter(null)}
                    className={`w-full px-3 py-2 text-start text-sm hover:bg-muted/50 transition-colors ${
                      !filterStatus ? "bg-muted/30" : ""
                    }`}
                  >
                    All Status
                  </button>

                  {["active", "inactive", "on-leave"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilter(status)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                        filterStatus === status ? "bg-muted/30" : ""
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-sm hover:bg-muted/30 transition-colors flex items-center gap-2 rounded-md cursor-pointer"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              <Download size={14} />
              تــصــديــر
              <ChevronDown size={14} className="opacity-50" />
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-background border border-border/50 shadow-lg rounded-md z-20">
                  <button
                    onClick={() => {
                      exportToCSV()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
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
        </div>
      </div>

      <div
        className={`bg-background overflow-hidden rounded-lg relative ${
          mounted ? (isDark ? "border border-zinc-600" : "border border-zinc-300") : "border-2 border-border"
        }`}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div
              className={`flex py-3 text-xs font-semibold text-foreground/90 ${
                mounted
                  ? isDark
                    ? "bg-blue-950/40 border-b border-zinc-600"
                    : "bg-blue-50 border-b border-zinc-300"
                  : "bg-muted/5 border-b-2 border-border"
              }`}
            >
              <div
                className={`flex items-center justify-center ${
                  mounted
                    ? isDark
                      ? "border-l border-zinc-600"
                      : "border-l border-zinc-200"
                    : "border-l-2 border-border"
                }`}
                style={{ width: columnWidths.checkbox }}
              >
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
                  checked={paginatedEmployees.length > 0 && selectedEmployees.length === paginatedEmployees.length}
                  onChange={handleSelectAll}
                />
              </div>

              <Resizable
                width={columnWidths.name}
                height={0}
                onResize={(e, data) => handleResize("name", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-l border-zinc-600"
                        : "border-l border-zinc-200"
                      : "border-l-2 border-border"
                  }`}
                  style={{ width: columnWidths.name }}
                >
                  <span>الإســم و اللـقـــب</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.email}
                height={0}
                onResize={(e, data) => handleResize("email", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-l border-zinc-600"
                        : "border-l border-zinc-200"
                      : "border-l-2 border-border"
                  }`}
                  style={{ width: columnWidths.email }}
                >
                  <span>الـــــرتــبـــــة</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.department}
                height={0}
                onResize={(e, data) => handleResize("department", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-l border-zinc-600"
                        : "border-l border-zinc-200"
                      : "border-l-2 border-border"
                  }`}
                  style={{ width: columnWidths.department }}
                >
                  <span>الــــرقــــــــم</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.position}
                height={0}
                onResize={(e, data) => handleResize("position", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-l border-zinc-600"
                        : "border-l border-zinc-200"
                      : "border-l-2 border-border"
                  }`}
                  style={{ width: columnWidths.position }}
                >
                  <span>المســـؤولــيــــة</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.salary}
                height={0}
                onResize={(e, data) => handleResize("salary", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-l border-zinc-600"
                        : "border-l border-zinc-200"
                      : "border-l-2 border-border"
                  }`}
                  style={{ width: columnWidths.salary }}
                >
                  <span>رقــم الهــاتــف</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.hireDate}
                height={0}
                onResize={(e, data) => handleResize("hireDate", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-l border-zinc-600"
                        : "border-l border-zinc-200"
                      : "border-l-2 border-border"
                  }`}
                  style={{ width: columnWidths.hireDate }}
                >
                  <span>آخـــر تكــويــــن</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.status}
                height={0}
                onResize={(e, data) => handleResize("status", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-l border-zinc-600"
                        : "border-l border-zinc-200"
                      : "border-l-2 border-border"
                  }`}
                  style={{ width: columnWidths.status }}
                >
                  <span>الفـــئــــــة</span>
                </div>
              </Resizable>

              <Resizable
                width={columnWidths.actions}
                height={0}
                onResize={(e, data) => handleResize("actions", e, data)}
                minConstraints={[80, 0]}
                maxConstraints={[400, 0]}
                handle={
                  <div className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize bg-transparent hover:bg-primary/40 transition-all" />
                }
              >
                <div
                  className={`flex items-center justify-center px-3 relative ${
                    mounted
                      ? isDark
                        ? "border-r border-zinc-600"
                        : "border-r border-zinc-200"
                      : "border-r-2 border-border"
                  }`}
                  style={{ width: columnWidths.actions }}
                >
                  <span>خيـــــــارات</span>
                </div>
              </Resizable>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${currentPage}-filter-${filterStatus || "all"}-sort-${
                  sortField || "none"
                }-search-${searchQuery}`}
                variants={shouldAnimate ? containerVariants : {}}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
              >
                {paginatedEmployees.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex justify-center mb-4">
                      <SearchX className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div
                      className="text-muted-foreground/70 text-sm"
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      لا توجد نتائج للبحث عن "{searchQuery}"
                    </div>
                    <div
                      className="text-muted-foreground/50 text-xs mt-2"
                      style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                    >
                      حاول البحث بإسم آخر
                    </div>
                  </div>
                ) : (
                  <>
                    {paginatedEmployees.map((employee) => (
                      <motion.div key={employee.id} variants={shouldAnimate ? rowVariants : {}}>
                        <div
                          className={`py-3.5 group relative transition-all duration-150 flex ${
                            mounted
                              ? isDark
                                ? "border-b border-zinc-600"
                                : "border-b border-zinc-200"
                              : "border-b-2 border-border"
                          } ${
                            selectedEmployees.includes(employee.id) ? "bg-muted/30" : "bg-muted/5 hover:bg-muted/20"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.checkbox }}
                          >
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
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={() => handleEmployeeSelect(employee.id)}
                            />
                          </div>

                          <div
                            className={`flex items-center min-w-0 px-3 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.name }}
                          >
                            <span
                              className="text-sm text-foreground truncate"
                              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                            >
                              {employee.name}
                            </span>
                          </div>

                          <div
                            className={`flex items-center min-w-0 px-3 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.email }}
                          >
                            <span
                              className="text-sm text-foreground/80 truncate"
                              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                            >
                              {employee.email}
                            </span>
                          </div>

                          <div
                            className={`flex items-center px-3 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.department }}
                          >
                            <span
                              className="text-sm text-foreground/80 truncate"
                              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                            >
                              {employee.department}
                            </span>
                          </div>

                          <div
                            className={`flex items-center min-w-0 px-3 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.position }}
                          >
                            <span
                              className="text-sm text-foreground/80 truncate"
                              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                            >
                              {employee.position}
                            </span>
                          </div>

                          <div
                            className={`flex items-center px-3 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.salary }}
                          >
                            <span
                              className="text-sm text-foreground/90"
                              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                              dir="ltr"
                            >
                              {formatPhoneNumber(employee.salary)}
                            </span>
                          </div>

                          <div
                            className={`flex items-center px-3 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.hireDate }}
                          >
                            <span
                              className="text-sm text-foreground/80"
                              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
                            >
                              {employee.hireDate}
                            </span>
                          </div>

                          <div
                            className={`flex items-center px-3 ${
                              mounted
                                ? isDark
                                  ? "border-l border-zinc-600"
                                  : "border-l border-zinc-200"
                                : "border-l-2 border-border"
                            }`}
                            style={{ width: columnWidths.status }}
                          >
                            {(() => {
                              const { bgColor, textColor, dotColor } = getStatusColor(employee.status)
                              return (
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap ${bgColor} ${textColor} rounded-md`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace("-", " ")}
                                </div>
                              )
                            })()}
                          </div>

                          <div
                            className={`flex items-center justify-center px-3 ${
                              mounted
                                ? isDark
                                  ? "border-r border-zinc-600"
                                  : "border-r border-zinc-200"
                                : "border-r-2 border-border"
                            }`}
                            style={{ width: columnWidths.actions }}
                          >
                            <button
                              onClick={() => {
                                // Action à définir
                                console.log("View employee:", employee.id)
                              }}
                              className="p-1.5 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                              aria-label="Voir les détails"
                            >
                              <Eye className="h-4 w-4 text-foreground/70 hover:text-foreground" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-xs text-muted-foreground/70" style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}>
            الصفحــة {currentPage} مــن {totalPages} - {sortedAndFilteredEmployees.length} مـوظــف
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-background border border-border text-foreground text-xs hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-md"
              style={{ fontFamily: "'Noto Naskh Arabic', sans-serif" }}
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
