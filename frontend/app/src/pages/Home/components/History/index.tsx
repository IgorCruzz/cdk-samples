import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { files } from '@/services/endpoints/files';
import { DataTable } from './data-table';
import { columns } from './columns';
import { useEffect, useState } from 'react';

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

  const { data, isLoading } = useQuery({
    queryKey: ['files', pagination.lastKey],
    queryFn: () => files.getFiles({
      startKey: pagination.lastKey,
    }),
    refetchOnWindowFocus: false,
    retry: false,
  });  

  useEffect(() => {
    console.log({ startKeys, lastKey: startKeys[pagination.pageIndex] });    
  },[pagination.pageIndex, startKeys]);

  return (
    <div className="w-1/2 h-full">
      <Card className="border border-[--border]  h-full">
        <CardHeader className="items-center justify-center">
          <CardTitle className="text-center">History</CardTitle>
        </CardHeader>

        <CardContent className="w-full flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span>Loading...</span>
            </div>
          ) : (
             <DataTable
            pagination={pagination}
            setPagination={setPagination}
            columns={columns}
            data={data?.data.itens || []}
            lastKey={data?.data.lastKey}
            setStartKeys={setStartKeys}
          />
          )}

          
         
        </CardContent>
      </Card>
    </div>
  );
};

 