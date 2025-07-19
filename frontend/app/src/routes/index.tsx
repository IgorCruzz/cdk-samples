import { createBrowserRouter } from "react-router-dom";
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import File from '@/pages/File';
import Customers from '@/pages/Customers';
import PrivateLayout from '@/components/AppLayout';
import PublicLayout from '@/components/PublicLayout'; 
import {PublicRoute} from './public-route';
import {PrivateRoute} from './private-route';
 
export const router = createBrowserRouter([  
  {
    element: <PublicRoute />, 
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <Auth /> },
        ],
      },
    ],
    },   
    {
    element: <PrivateRoute />, 
    children: [
      { 
        element: <PrivateLayout />,
        children: [
          { path: "home", element: <Home /> }, 
          { path: "upload", element: <File /> },
          { path: "customers", element: <Customers /> },
        ],
      },
    ],
  },
]);
 
