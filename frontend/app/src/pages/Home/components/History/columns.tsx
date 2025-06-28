import { type ColumnDef } from "@tanstack/react-table"
import { CircleEllipsis, ThumbsDown, ThumbsUp } from "lucide-react"

export type File = {
  size: number
  status: string 
  key: string
  successLines: number
  failedLines: number
}

export const columns: ColumnDef<File>[] = [
  {
    accessorKey: "key",
    header: "Key",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: (info) => `${info.getValue()} bytes`,
  },
  {
    accessorKey: "successLines",
    header: "Success Lines",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "failedLines",
    header: "Failed Lines",
    cell: (info) => info.getValue(),
  },
{
  accessorKey: "status",
  header: "Status",  
  cell: (info) => {
    const rowData = info.row.original;

    const successLines = rowData.successLines; 

    return (
    <>
    {info.getValue() === 'COMPLETED' && (
      <>
       {successLines > 0 ? <ThumbsUp color="green" /> : <ThumbsDown color="red" />}  
      </>
    )}

    {info.getValue() === 'FAILED' && (<ThumbsDown color="red" />)}

    {info.getValue() === 'PROCESSING' && (<CircleEllipsis />)}
    </>     
  )
  }
}
]