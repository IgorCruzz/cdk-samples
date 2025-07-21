import { type ColumnDef } from "@tanstack/react-table"

export type Customers = {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

export const columns: ColumnDef<Customers>[] = [ 
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "cnpj",
    header: "CNPJ",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "state",
    header: "State",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "zipCode",
    header: "ZIP Code",
    cell: (info) => info.getValue(),
  },
]
