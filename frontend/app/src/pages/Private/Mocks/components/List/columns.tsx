import { CopyButton } from '@/components/CopyButton';
import { CurlSheet } from '@/components/CurlSheet';
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
    header: 'Create',
    cell: (info) => {
      const curlCommand = `
      curl 
      --location '${import.meta.env.VITE_API_URL}/68a3b89d64b9a8037c97582d' \
      --header 'Content-Type: application/json' \
      --data '{
          "nome": "",
          "cnpj": "",
          "email": "",
          "telefone": "",
          "endereco": "",
          "cidade": "",
          "estado": "",
          "cep": ""
      }'`;

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
      const curlCommand = `curl 
      --location 
      --request PUT '${import.meta.env.VITE_API_URL}/68a3b89d64b9a8037c97582d/68a3d4e7a4b9a633d2652ab2' \
      --header 'Content-Type: application/json' \
      --data '{
          "nome": "",
          "cnpj": "",
          "email": "",
          "telefone": "",
          "endereco": "",
          "cidade": "",
          "estado": "",
          "cep": ""
      }'`;

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
      const curlCommand = `curl --location '${import.meta.env.VITE_API_URL}/68a3b89d64b9a8037c97582d?limit=10&page=1'`;

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
      const curlCommand = `
      curl 
      --location 
      --request DELETE '${import.meta.env.VITE_API_URL}/68a3b89d64b9a8037c97582d/68a3b8a6a1433c1ab714ee71'`;

      return info.row.original.status === 'COMPLETED' ? (
        <CurlSheet curlText={curlCommand} triggerLabel="Delete" />
      ) : (
        'N/A'
      );
    },
  },
];
