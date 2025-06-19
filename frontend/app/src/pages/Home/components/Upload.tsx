import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card" 
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { Form } from "@radix-ui/react-form"; 
import { files } from '@/services/endpoints/files';
import { useMutation } from '@tanstack/react-query'

export function Upload() {
  const { register, handleSubmit } = useForm<{ file: File | null }>({
    defaultValues: {
      file: null,
    },
  }); 

  const { mutateAsync } = useMutation({ mutationFn: files.preSignedUrl })

  const onSubmit = async ({ file }: { file: File | null }) => {
    
    const { data } =  await mutateAsync();

    console.log({ data, file });    
  };

  return ( 
    <div className="w-1/2 text-amber-50"> 
      <Card className="bg-[#121314]">
      <CardHeader className="item-center justify-center">
        <CardTitle className="text-center text-amber-50">Upload a File</CardTitle>
        <CardDescription className="text-amber-50">Select a file to upload and click the submit button.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center">
        <Form onSubmit={handleSubmit(onSubmit)}>   
            <Input type="file" 
            {...register('file')}
            />
            <Button type="submit">Submit</Button>        
        </Form>
      </CardContent>
      </Card>    
    </div>
  )
}

 