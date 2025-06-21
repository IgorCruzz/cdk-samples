import { Card, CardContent,   CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { useQuery } from '@tanstack/react-query'
import { files } from '@/services/endpoints/files';

export const Historic: React.FC = () => {
  const { data } = useQuery({
    queryKey: [],
    queryFn: files.getFiles, 
    refetchOnWindowFocus: false,
    retry: false,
  });

  console.log({ data });
  

  return (
    <div className="w-1/2 text-amber-50 h-screen"> 
      <Card className="bg-[#121314] h-screen" >
      <CardHeader className="item-center justify-center">
        <CardTitle className="text-center text-amber-50">Historico</CardTitle>
       </CardHeader>

      <CardContent className="flex flex-col items-center justify-center">
       a
      </CardContent>
      </Card>    
    </div>
  )
} 