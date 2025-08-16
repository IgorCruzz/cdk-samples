import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/query-client';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" duration={2000} />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
