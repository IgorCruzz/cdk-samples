import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card" 
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'

export function Upload() { 
  const form = useForm<{ file: File | null }>({
    defaultValues: {
      file: null,
    },
  });

  const onSubmit = ({ file }: { file: File | null }) => {
    console.log(file);
    // Handle file upload logic here
  };

  return ( 
    <div className="w-1/2"> 
      <Card>
      <CardHeader className="item-center justify-center">
        <CardTitle className="text-center">Upload a File</CardTitle>
        <CardDescription>Select a file to upload and click the submit button.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>  
            <input type="file" 
            {...form.register('file')}
            />
            <button type="submit">Submit</button>s
          </form>          
        </Form>
      </CardContent>
      </Card>    
    </div>
  )
}

 