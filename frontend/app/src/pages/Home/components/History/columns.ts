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
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
  }, 
]