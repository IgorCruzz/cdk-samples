import { createBrowserRouter } from "react-router-dom";
import Auth from '@/pages/Public/Auth';
import Home from '@/pages/Private/Home';
import File from '@/pages/Private/File';
import Users from '@/pages/Private/Users';
import Customers from '@/pages/Private/Customers';
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
          { path: "users", element: <Users /> },
        ],
      },
    ],
  },
]);
 
