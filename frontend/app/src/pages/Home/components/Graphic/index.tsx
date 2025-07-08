import { Pie, PieChart } from "recharts"

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
  { name: "completed", value: data?.data.totalSuccess, fill: "var(--color-completed)" },
  { name: "failed", value: data?.data.totalFailed, fill: "var(--color-failed)" },
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
          <>

             <div className="flex justify-center gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartConfig.completed.color }}
                ></span>
                <span>
                  {chartConfig.completed.label}: {data?.data.totalSuccess ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartConfig.failed.color }}
                ></span>
                <span>
                  {chartConfig.failed.label}: {data?.data.totalFailed ?? 0}
                </span>
              </div>
            </div>
            
           <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >

          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            /> 
           <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              stroke="0" 
            />
          </PieChart>
           
          
        </ChartContainer>

            </>
        )} 
       
      </CardContent>
    </Card>
  )
}
