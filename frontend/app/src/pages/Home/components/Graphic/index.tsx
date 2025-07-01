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
import { files } from "@/services/endpoints/files"
import { useQuery } from "@tanstack/react-query"

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
  const { data, isLoading } = useQuery({
    queryKey: ["files-statistics"],
    queryFn: files.statistics,
    refetchOnWindowFocus: false,
  })

  const chartData = [
  { name: "completed", value: data?.data.Completed, fill: "var(--color-completed)" },
  { name: "failed", value: data?.data.Failed, fill: "var(--color-failed)" },
  ]

  return (
    <Card className="h-1/2 rounded-tl-4xl rounded-br-4xl border-t-green-500 border-t-4">
      <CardHeader className="text-center">
        <CardTitle>Statistic</CardTitle>
        <CardDescription>
          Overview of your file upload results, showing how many were completed successfully and how many failed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span>Loading...</span>
          </div>
        ): (
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
        )} 
       
      </CardContent>
    </Card>
  )
}
