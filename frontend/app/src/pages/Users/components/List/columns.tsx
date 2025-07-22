import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table"
import { Delete } from 'lucide-react';
import { AddOrUpdate } from '../AddOrUpdate'
import { UserInput } from '@/schemas/users'
 

export const columns: ColumnDef<UserInput>[] = [ 
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
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {  
      return (
      <div className="flex items-center gap-2"> 
        <AddOrUpdate type="update" user={row.original}/> 
        <Button variant="destructive" size="sm" className="bg-amber-800"><Delete /></Button>
      </div>
    )
    },
  }
]
