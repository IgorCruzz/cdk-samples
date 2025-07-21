import { type ColumnDef } from "@tanstack/react-table"

export type Customers = {
  id: string;
  name: string;
  email: string;
};

export const columns: ColumnDef<Customers>[] = [ 
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  }, 
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue(),
  }, 
]
