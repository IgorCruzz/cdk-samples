import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { files } from '@/services/endpoints/files';

export const Historic = () => {
  const { data } = useQuery({
    queryKey: [],
    queryFn: files.getFiles,
    refetchOnWindowFocus: false,
    retry: false,
  });

  console.log({ data });

  return (
    <div className="w-1/2 h-full">
      <Card className="border border-[--border]">
        <CardHeader className="items-center justify-center">
          <CardTitle className="text-center">Histórico</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center">
          {/* Conteúdo do histórico aqui */}
          a
        </CardContent>
      </Card>
    </div>
  );
};
