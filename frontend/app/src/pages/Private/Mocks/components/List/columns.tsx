import { CurlSheet } from '@/components/CurlSheet';
import { type ColumnDef } from '@tanstack/react-table';
import { CircleEllipsis, ThumbsDown, ThumbsUp } from 'lucide-react';
import { DeleteApi } from '../DeleteApi';

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
    header: 'Api',
    cell: (info) => '/' + info.getValue(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      return (
        <>
          {info.getValue() === 'COMPLETED' && <ThumbsUp color="green" />}

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
        <CurlSheet curlText={curlCommand} triggerLabel="POST" />
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

      return info.row.original.status === 'COMPLETED' ? <CurlSheet curlText={curlCommand} triggerLabel="PUT" /> : 'N/A';
    },
  },
  {
    header: 'Read',
    cell: (info) => {
      const id = info.row.original?.userId;

      const endpoint = info.row.original.endpoint;

      const curlCommand = `curl --location '${import.meta.env.VITE_API_URL}${id}/${endpoint}?limit=10&page=1'`;

      return info.row.original.status === 'COMPLETED' ? <CurlSheet curlText={curlCommand} triggerLabel="GET" /> : 'N/A';
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
        <CurlSheet curlText={curlCommand} triggerLabel="DELETE" />
      ) : (
        'N/A'
      );
    },
  },
  {
    header: 'Exclude',
    cell: (info) => {
      return <DeleteApi id={info.row.original.id} />;
    },
  },
];
