import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { files } from '@/services/endpoints/files';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from "sonner";
import DropField from '@/components/DropField';
import { useState } from "react";
import { fileSchema } from '@/schemas/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { SendHorizontal } from "lucide-react";

export function Upload()  {
  const form = useForm<{ file: File }>({
    resolver: zodResolver(fileSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);  

  const { mutateAsync: PreSignedUrlMutateAsync } = useMutation({
    mutationFn: files.preSignedUrl,
  });

  const { mutateAsync: UploadMutateAsync } = useMutation({
    mutationFn: async ({ url, file }: { url: string; file: File }) => {
      return await axios.put(url, file, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      });
    }
  });

  const onSubmit = async ({ file }: { file: File }) => {
    try {
      setLoading(true);

      const { data } = await PreSignedUrlMutateAsync();

      await UploadMutateAsync({
        url: data.url,
        file,
      });

      toast.success('File uploaded successfully!');
      form.reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error('Oops! Something went wrong while uploading the file.');
      }
      console.error(error);
    } finally { 
      setLoading(false);
    }
  };

  return ( 
      <Card className="h-1/2 rounded-tl-4xl rounded-br-4xl border-t-green-500 border-t-4 ">

        <CardHeader className="text-center">
          <CardTitle>Upload a File</CardTitle>
          <CardDescription>
            Select a file to upload and click the submit button.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full">
              <DropField name="file" />
              <Button type="submit" disabled={!form.formState.isValid || loading}>
                {loading ? `${uploadProgress}%` : <SendHorizontal />}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card> 
  );
}
