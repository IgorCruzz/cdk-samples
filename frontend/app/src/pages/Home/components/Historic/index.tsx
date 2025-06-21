import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { files } from '@/services/endpoints/files';
import { DataTable } from './data-table';
import { columns } from './columns';

export const Historic = () => {
  const { data, isLoading } = useQuery({
    queryKey: [],
    queryFn: files.getFiles,
    refetchOnWindowFocus: false,
    retry: false,
  }); 

  return (
    <div className="w-1/2 h-full">
      <Card className="border border-[--border]">
        <CardHeader className="items-center justify-center">
          <CardTitle className="text-center">Histórico</CardTitle>
        </CardHeader>

        <CardContent className="w-full flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span>Loading...</span>
            </div>
          ) : (
             <DataTable
            columns={columns}
            data={data?.data}
          />
          )}
         
        </CardContent>
      </Card>
    </div>
  );
};

 