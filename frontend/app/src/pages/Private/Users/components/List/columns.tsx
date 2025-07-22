
import { type ColumnDef } from "@tanstack/react-table"
import { AddOrUpdate } from '../AddOrUpdate'
import { UserInput } from '@/schemas/users'
import { Delete } from '../Delete'

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
        <Delete user={
          {
            id: row.original.id!,
            name: row.original.name
          }
        } />
      </div>
    )
    },
  }
]
