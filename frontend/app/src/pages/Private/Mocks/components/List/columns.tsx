import { CopyButton } from "@/components/CopyButton"
import { formatBytes } from "@/utils/formatByes"
import { type ColumnDef } from "@tanstack/react-table"
import { CircleEllipsis, ThumbsDown, ThumbsUp, CopyIcon } from "lucide-react"

export type File = {
  size: number
  status: string 
  key: string
  successLines: number
  failedLines: number
  id: string
}

export const columns: ColumnDef<File>[] = [
  {
    accessorKey: "filename",
    header: "Filename",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: (info) => `${formatBytes(info.getValue() as number)}`,
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

    {info.getValue() === 'PROCESSING' || info.getValue() === 'PENDING' && (<CircleEllipsis />)}
    </>     
  )
  }
},
   { 
    header: "Link",
    cell: (info) => {
      return info.row.original.status === 'COMPLETED' ? (
        <div className="flex items-center gap-2">
          <p>{`${import.meta.env.VITE_API_URL}${info.row.original.id}`}</p>
          <CopyButton text={`${import.meta.env.VITE_API_URL}${info.row.original.id}`} />
        </div>
      ) : (
        'N/A'
      );
    },
  },
]