import { type ColumnDef } from "@tanstack/react-table"

export type File = {
  size: number
  status: string 
  key: string
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
    cell: (info) => info.getValue(),
  },

]