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

export function Upload()  {
  const form = useForm<{ file: File }>({
    resolver: zodResolver(fileSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);

  const { mutateAsync: PreSignedUrlMutateAsync } = useMutation({
    mutationFn: files.preSignedUrl,
  });

  const { mutateAsync: UploadMutateAsync } = useMutation({
    mutationFn: async ({ url, file }: { url: string; file: File }) => {
      return await axios.put(url, file);
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
        toast.error('Erro ao salvar.');
      }
      console.error(error);
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="h-full border border-[--border]">
        <CardHeader className="items-center justify-center">
          <CardTitle className="text-center">Upload a File</CardTitle>
          <CardDescription className="text-center">
            Select a file to upload and click the submit button.
          </CardDescription>
        </CardHeader>

        <CardContent className="h-full flex flex-col items-center justify-center">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full flex flex-col items-center justify-center gap-3">
              <DropField name="file" />
              <Button type="submit" disabled={!form.formState.isValid} className="w-full">
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
