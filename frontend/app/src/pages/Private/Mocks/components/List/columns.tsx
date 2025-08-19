import { CopyButton } from '@/components/CopyButton';
import { formatBytes } from '@/utils/formatByes';
import { type ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, ThumbsDown, ThumbsUp } from 'lucide-react';

export type File = {
  size: number;
  status: string;
  key: string;
  lines: number;
  id: string;
};

export const columns: ColumnDef<File>[] = [
  {
    accessorKey: 'filename',
    header: 'Filename',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: (info) => `${formatBytes(info.getValue() as number)}`,
  },
  {
    accessorKey: 'lines',
    header: 'Lines',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const rowData = info.row.original;

      const lines = rowData.lines;

      return (
        <>
          {info.getValue() === 'COMPLETED' && (
            <>{lines > 0 ? <ThumbsUp color="green" /> : <ThumbsDown color="red" />}</>
          )}

          {info.getValue() === 'FAILED' && <ThumbsDown color="red" />}

          {(info.getValue() === 'PROCESSING' || info.getValue() === 'PENDING') && <CircleEllipsis />}
        </>
      );
    },
  },
  {
    header: 'Actions',
    cell: (info) => {
      return info.row.original.status === 'COMPLETED' ? (
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <CopyButton method="CREATE" text={`${import.meta.env.VITE_API_URL}${info.row.original.id}/{id}`} />
          </div>

          <div className="flex items-center gap-2">
            <CopyButton method="READ" text={`${import.meta.env.VITE_API_URL}${info.row.original.id}?limit=10&page=1`} />
          </div>

          <div className="flex items-center gap-2">
            <CopyButton method="UPDATE" text={`${import.meta.env.VITE_API_URL}${info.row.original.id}/{id}`} />
          </div>

          <div className="flex items-center gap-2">
            <CopyButton method="DELETE" text={`${import.meta.env.VITE_API_URL}${info.row.original.id}/{id}`} />
          </div>
        </div>
      ) : (
        'N/A'
      );
    },
  },
];
