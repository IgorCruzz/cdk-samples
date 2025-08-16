import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { files } from '@/services/endpoints/files';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import DropField from '@/components/DropField';
import { useState } from 'react';
import { fileSchema } from '@/schemas/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { SendHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload as UploadIcn } from 'lucide-react';
import { queryClient } from '@/lib/query-client';

export function Upload() {
  const form = useForm<{ file: File }>({
    resolver: zodResolver(fileSchema),
    mode: 'onChange',
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
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });
    },
  });

  const onSubmit = async ({ file }: { file: File }) => {
    try {
      setLoading(true);

      const { data } = await PreSignedUrlMutateAsync({
        size: file.size,
        filename: file.name,
      });

      await UploadMutateAsync({
        url: data.url,
        file,
      });

      toast.success('File uploaded successfully!');
      form.reset();

      queryClient.invalidateQueries({ queryKey: ['files'] });
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
    <Dialog>
      <DialogTrigger className="btn">
        <UploadIcn />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>Select a file to upload and click the submit button.</DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full">
                <DropField name="file" />
                <Button variant="outline" type="submit" disabled={!form.formState.isValid || loading}>
                  {loading ? `${uploadProgress}%` : <SendHorizontal />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
