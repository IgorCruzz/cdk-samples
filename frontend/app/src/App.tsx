 
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Home from './pages/Home';
import Layout from './components/AppLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';











const queryClient = new QueryClient();

export default function App() {
  return ( 
      <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" />
         <Routes>
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
