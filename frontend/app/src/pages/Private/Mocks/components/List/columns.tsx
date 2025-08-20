import { CurlSheet } from '@/components/CurlSheet';
import { type ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, ThumbsDown, ThumbsUp } from 'lucide-react';

export type File = {
  size: number;
  status: string;
  key: string;
  lines: number;
  id: string;
  endpoint: string;
  userId: string;
};

export const columns = (keys: string): ColumnDef<File>[] => [
  {
    accessorKey: 'endpoint',
    header: 'Endpoint',
    cell: (info) => '/' + info.getValue(),
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
    header: 'Create',
    cell: (info) => {
      const id = info.row.original?.userId;

      const endpoint = info.row.original.endpoint;

      const curlCommand = [
        'curl',
        `--location '${import.meta.env.VITE_API_URL}${id}/${endpoint}'`,
        "--header 'Content-Type: application/json'",
        `--data '${JSON.stringify(keys, null, 2)}'`,
      ].join(' \\\n  ');

      return info.row.original.status === 'COMPLETED' ? (
        <CurlSheet curlText={curlCommand} triggerLabel="Create" />
      ) : (
        'N/A'
      );
    },
  },

  {
    header: 'Update',
    cell: (info) => {
      const id = info.row.original?.userId;

      const endpoint = info.row.original.endpoint;

      const curlCommand = `curl  
      --location 
      --request PUT '${import.meta.env.VITE_API_URL}${id}/${endpoint}/{PUT_ID_HERE}' \
      --header 'Content-Type: application/json' \
      --data '${JSON.stringify(keys)}'`;

      return info.row.original.status === 'COMPLETED' ? (
        <CurlSheet curlText={curlCommand} triggerLabel="Update" />
      ) : (
        'N/A'
      );
    },
  },
  {
    header: 'Read',
    cell: (info) => {
      const id = info.row.original?.userId;

      const endpoint = info.row.original.endpoint;

      const curlCommand = `curl --location '${import.meta.env.VITE_API_URL}${id}/${endpoint}?limit=10&page=1'`;

      return info.row.original.status === 'COMPLETED' ? (
        <CurlSheet curlText={curlCommand} triggerLabel="Read" />
      ) : (
        'N/A'
      );
    },
  },
  {
    header: 'Delete',
    cell: (info) => {
      const id = info.row.original?.userId;

      const endpoint = info.row.original.endpoint;

      const curlCommand = `
      curl 
      --location 
      --request DELETE '${import.meta.env.VITE_API_URL}${id}/${endpoint}/{PUT_ID_HERE}'`;

      return info.row.original.status === 'COMPLETED' ? (
        <CurlSheet curlText={curlCommand} triggerLabel="Delete" />
      ) : (
        'N/A'
      );
    },
  },
];
