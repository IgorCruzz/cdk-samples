"use client"

import { Pie, PieChart, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { name: "completed", value: 100, fill: "var(--color-completed)" },
  { name: "failed", value: 20, fill: "var(--color-failed)" },
]

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-1)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Graphic() {
  return (
    <Card className="h-1/2 rounded-tl-4xl rounded-br-4xl border-t-green-500 border-t-4">
      <CardHeader className="text-center">
        <CardTitle>Statistic</CardTitle>
        <CardDescription>
          Overview of your file upload results, showing how many were completed successfully and how many failed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              stroke="0"
              label={({ name, value }) => `${name}: ${value}`}

            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
