import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { files } from '@/services/endpoints/files';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import DropField from '@/components/DropField';
import { useState } from 'react';
import { fileSchema } from '@/schemas/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal, Upload as UploadIcn } from 'lucide-react';
import { queryClient } from '@/lib/query-client';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function Upload() {
  const form = useForm<{ file: File; endpoint: string }>({
    resolver: zodResolver(fileSchema),
    mode: 'onChange',
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [open, setOpen] = useState(false);

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

  const onSubmit = async ({ file, endpoint }: { file: File; endpoint: string }) => {
    try {
      setLoading(true);

      const { data } = await PreSignedUrlMutateAsync({
        size: file.size,
        filename: file.name,
        endpoint,
      });

      const { url } = data.data;

      await UploadMutateAsync({ url, file });

      toast.success('File uploaded successfully!');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Upload failed');
      } else {
        toast.error('Upload failed');
      }
      console.error(error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (loading) return;
    setOpen(value);
    if (!value) {
      form.reset();
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <span className="px-3 select-none">/</span>
                    <Input
                      {...form.register('endpoint')}
                      placeholder="your-endpoint"
                      className="flex-1 border-none focus:ring-0 focus:border-none"
                      required
                    />
                  </div>
                </div>

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
