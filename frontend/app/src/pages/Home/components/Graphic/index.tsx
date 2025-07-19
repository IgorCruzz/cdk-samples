import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { files } from "@/services/endpoints/files"
import { useQuery } from "@tanstack/react-query"

export function Graphic() {
  const { data } = useQuery({
    queryKey: ["files-statistics"],
    queryFn: files.statistics,
  })

  return (
    <Card> 
      <CardContent className="flex items-center justify-center gap-4 pb-0">
         
            <div>
              Completed:  {data?.data.totalSuccess ?? 0}
            </div>
            <div>
              Failed: {data?.data.totalFailed ?? 0}
            </div>
           
      
      </CardContent>
    </Card>
  )
}
