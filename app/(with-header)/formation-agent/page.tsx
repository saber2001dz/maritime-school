"use client";

import React, { useState, useMemo } from "react";
import { ProjectDataTable, Project } from "@/components/ui/project-data-table"; // Adjust path as needed
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter, Columns } from "lucide-react";

// --- MOCK DATA ---
const mockProjects: Project[] = [
    { id: "proj-01", name: "ShadCN Clone", repository: "https://github.com/ruixenui/ruixen-buttons", team: "UI Guild", tech: "Next.js", createdAt: "2024-06-01", contributors: "20/15", status: { text: "نجاح", variant: "success" } },
    { id: "proj-02", name: "RUIXEN Components", repository: "https://github.com/ruixenui/ruixen-buttons", team: "Component Devs", tech: "React", createdAt: "2024-05-22", contributors: "20/18", status: { text: "قيد التكوين", variant: "inProgress" } },
    { id: "proj-03", name: "CV Jobs Platform", repository: "https://github.com/ruixenui/ruixen-buttons", team: "CV Core", tech: "Spring Boot", createdAt: "2024-06-05", contributors: "20/12", status: { text: "نجاح", variant: "success" } },
    { id: "proj-04", name: "Ruixen UI Docs", repository: "https://github.com/ruixenui/ruixen-buttons", team: "Tech Writers", tech: "Markdown", createdAt: "2024-04-19", contributors: "20/16", status: { text: "انقطع", variant: "interrupted" } },
    { id: "proj-05", name: "Job Portal Analytics", repository: "https://github.com/ruixenui/ruixen-buttons", team: "Data Squad", tech: "Python", createdAt: "2024-03-30", contributors: "20/14", status: { text: "نجاح", variant: "success" } },
    { id: "proj-06", name: "Ui Ux Design", repository: "https://github.com/ruixenui/ruixen-buttons", team: "Infra", tech: "Socket.io", createdAt: "2024-06-03", contributors: "20/17", status: { text: "لم يلتحق", variant: "notJoined" } },
    { id: "proj-07", name: "ShadCN Clone", repository: "https://github.com/ruixenui/ruixen-buttons", team: "UI Guild", tech: "Next.js", createdAt: "2024-06-01", contributors: "20/13", status: { text: "قيد التكوين", variant: "inProgress" } },
    { id: "proj-08", name: "RUIXEN Components", repository: "https://github.com/ruixenui/ruixen-buttons", team: "Component Devs", tech: "React", createdAt: "2024-05-22", contributors: "20/19", status: { text: "نجاح", variant: "success" } },
    { id: "proj-09", name: "CV Jobs Platform", repository: "https://github.com/ruixenui/ruixen-buttons", team: "CV Core", tech: "Spring Boot", createdAt: "2024-06-05", contributors: "20/11", status: { text: "انقطع", variant: "interrupted" } },
    { id: "proj-10", name: "Ruixen UI Docs", repository: "https://github.com/ruixenui/ruixen-buttons", team: "Tech Writers", tech: "Markdown", createdAt: "2024-04-19", contributors: "20/16", status: { text: "لم يلتحق", variant: "notJoined" } },
];

const allColumns: (keyof Project)[] = ["name", "repository", "team", "tech", "createdAt", "contributors", "status"];

const Demo = () => {
  const [techFilter, setTechFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Project>>(new Set(allColumns));

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const techMatch = techFilter === "" || project.tech.toLowerCase().includes(techFilter.toLowerCase());
      const statusMatch = statusFilter === "all" || project.status.variant === statusFilter;
      return techMatch && statusMatch;
    });
  }, [techFilter, statusFilter]);

  const toggleColumn = (column: keyof Project) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background py-6 md:py-12">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="mb-8 md:mb-12">
          <div className="mt-10 flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-4">
              <Input
                placeholder="Filter by technology..."
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="max-w-xs"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4" />
                    <span>Status</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked={statusFilter === "all"} onCheckedChange={() => setStatusFilter("all")}>All</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === "active"} onCheckedChange={() => setStatusFilter("active")}>Active</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === "inProgress"} onCheckedChange={() => setStatusFilter("inProgress")}>In Progress</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === "onHold"} onCheckedChange={() => setStatusFilter("onHold")}>On Hold</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Columns className="h-4 w-4" />
                  <span>Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    className="capitalize"
                    checked={visibleColumns.has(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ProjectDataTable projects={filteredProjects} visibleColumns={visibleColumns} />
        </div>
      </div>
    </div>
  );
};

export default Demo;