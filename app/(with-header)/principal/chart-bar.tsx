"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "A bar chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
  { month: "July", desktop: 256 },
  { month: "August", desktop: 189 },
  { month: "September", desktop: 298 },
  { month: "October", desktop: 342 },
  { month: "November", desktop: 275 },
  { month: "December", desktop: 318 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#06417F",
  },
} satisfies ChartConfig

export function ChartBarDefault() {
  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="font-semibold">تطـور عـدد المتـربصيـن</CardTitle>
        <CardDescription className="font-[--font-noto-naskh-arabic]">جانفي - ديسمبر 2025</CardDescription>
      </CardHeader>
      <CardContent className="p-0 px-2 pb-4" dir="rtl">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} layout="horizontal">
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              reversed={true}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
