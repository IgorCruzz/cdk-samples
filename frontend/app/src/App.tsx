 
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Home from './pages/Home';
import Layout from './components/AppLayout';


export default function App() {
  return ( 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
            } />
        </Routes>
      </BrowserRouter> 
  );
}
