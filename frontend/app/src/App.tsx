 
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Home from './pages/Home';
import Layout from './components/AppLayout';
import PublicLayout from './components/PublicLayout';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/query-client';
import Auth from './pages/Auth';

export default function App() {
  return ( 
      <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" duration={2000} />
         <Routes>
          <Route path="/"  element={
            <PublicLayout>
               <Auth />
            </PublicLayout>
           } />
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
            } />
        </Routes>
      </QueryClientProvider>       
      </BrowserRouter> 
  );
}
