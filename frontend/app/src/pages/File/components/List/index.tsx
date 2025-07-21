import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { files } from '@/services/endpoints/files';
import { DataTable } from './data-table';
import { columns } from './columns';
import { useState } from 'react';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { queryClient } from '@/lib/query-client';

export const List = () => {
 
  const [pagination, setPagination] = useState<
  {
    pageIndex: number;
    pageSize: number; 
  }
  >({
    pageIndex: 0,
    pageSize: 10, 
  });

  const { data, isLoading, refetch, isSuccess } = useQuery({
    queryKey: ['files', pagination],
    queryFn: () => files.getFiles({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }),
    // refetchInterval: 10000, 
  });  

  if(isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['files-statistics'] });
  }

  return ( 
      <Card className="flex flex-col h-full">
        <CardHeader className="flex items-center justify-center gap-4">
          <CardTitle className="text-center">Files</CardTitle>
           <Button onClick={() => refetch()}><RefreshCw /></Button>
        </CardHeader>

        <CardContent className="h-full flex items-center justify-center">
          <div className="flex flex-col justify-between w-full h-full">
            <DataTable
            pagination={pagination}
            setPagination={setPagination}
            columns={columns}
            data={data?.data.itens || []} 
            total={data?.data.count || 0}
            isLoading={isLoading}
            />
         
            <Pagination
              pagination={pagination}
              setPagination={setPagination}
              total={data?.data.count || 0}
            />
          </div>     
        </CardContent>
      </Card> 
  );
};

 