import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { files } from '@/services/endpoints/files';
import { DataTable } from './data-table';
import { columns } from './columns';
import { useState } from 'react';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const History = () => {
  const [startKeys, setStartKeys] = useState<{ startKey: string | null }[]>([{ startKey: null }]);

  const [pagination, setPagination] = useState<
  {
    pageIndex: number;
    pageSize: number;
    lastKey?: string | null;
  }
  >({
    pageIndex: 0,
    pageSize: 10,
    lastKey: null,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['files', pagination.lastKey],
    queryFn: () => files.getFiles({
      startKey: pagination.lastKey,
    }),

  });  

  return ( 
      <Card className="flex flex-col h-full rounded-tl-4xl rounded-br-4xl border-t-green-500 border-t-4">
        <CardHeader className="flex items-center justify-center gap-4">
          <CardTitle className="text-center">History</CardTitle>
           <Button onClick={() => refetch()}><RefreshCw /></Button>
        </CardHeader>

        <CardContent className="h-full flex items-center justify-center">
          {isLoading ? (
            <div>
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex flex-col justify-between w-full h-full">
            <DataTable
            pagination={pagination}
            setPagination={setPagination}
            columns={columns}
            data={data?.data.itens || []} 
            />

          <Pagination 
          pagination={pagination}
          setPagination={setPagination} 
          lastKey={data?.data.lastKey}
          setStartKeys={setStartKeys}
          startKeys={startKeys}
          />
          </div>
          )}        
        </CardContent>
      </Card> 
  );
};

 