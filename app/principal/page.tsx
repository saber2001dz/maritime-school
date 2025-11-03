"use client"

import { Header } from "@/components/ui/header"
import { ResizableTable, type Employee } from "@/components/ui/resizable-table"

export default function ResizableTableDemo() {
  const handleEmployeeSelect = (employeeId: string) => {
    console.log(`Selected employee:`, employeeId)
  }

  const handleColumnResize = (columnKey: string, newWidth: number) => {
    console.log(`Column ${columnKey} resized to ${newWidth}px`)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-6 md:py-12">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="mb-8 md:mb-12">
            <ResizableTable
              className="mt-10"
              title="Employee"
              onEmployeeSelect={handleEmployeeSelect}
              onColumnResize={handleColumnResize}
            />
          </div>
        </div>
      </div>
    </>
  )
}
