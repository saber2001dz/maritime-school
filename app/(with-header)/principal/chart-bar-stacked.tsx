"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Period = "12" | "6" | "3"

type ChartBarStackedProps = {
  chartData: { month: string; currentYear: number; previousYear: number }[]
  currentYear: number
  previousYear: number
}

// Couleurs du mode dark utilisées pour les deux modes (light & dark)
const chartConfig = {
  currentYear: {
    label: "",
    color: "oklch(0.488 0.243 264.376)",
  },
  previousYear: {
    label: "",
    color: "oklch(0.696 0.17 162.48)",
  },
} satisfies ChartConfig

const PERIODS: { value: Period; label: string }[] = [
  { value: "12", label: "سنوي" },
  { value: "6", label: "6 أشهر" },
  { value: "3", label: "3 أشهر" },
]

export function ChartBarStacked({ chartData, currentYear, previousYear }: ChartBarStackedProps) {
  const [period, setPeriod] = useState<Period>("12")

  const config = {
    ...chartConfig,
    currentYear: { ...chartConfig.currentYear, label: String(currentYear) },
    previousYear: { ...chartConfig.previousYear, label: String(previousYear) },
  }

  const currentMonth = new Date().getMonth() // 0-based

  const filteredData = (() => {
    if (period === "12") return chartData
    if (period === "3") {
      const quarterStart = Math.floor(currentMonth / 3) * 3
      return chartData.slice(quarterStart, quarterStart + 3)
    }
    // 6 mois : semestre en cours (jan-juin ou juil-dec)
    const semesterStart = currentMonth < 6 ? 0 : 6
    return chartData.slice(semesterStart, semesterStart + 6)
  })()

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="font-semibold">تطـور عـدد المتـربصيـن</CardTitle>
            <CardDescription className="font-[--font-noto-naskh-arabic]">
              {previousYear} - {currentYear}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-lg border p-1 shrink-0">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  period === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 px-2 pb-4" dir="rtl">
        <ChartContainer id="chart-bar-stacked" config={config} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              reversed={true}
            />
            <YAxis tickLine={false} axisLine={false} width={30} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="currentYear"
              stackId="a"
              fill="var(--color-currentYear)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="previousYear"
              stackId="a"
              fill="var(--color-previousYear)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
