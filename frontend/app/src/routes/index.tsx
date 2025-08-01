import { createBrowserRouter } from "react-router-dom";
import Auth from '@/pages/Public/Auth';
import Home from '@/pages/Private/Home';
import Mocks from '@/pages/Private/Mocks';
import Users from '@/pages/Private/Users'; 
import Confirm from '@/pages/Public/Confirm';
import Redirect from '@/pages/Public/Redirect';
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
          { path: "/redirect", element: <Redirect /> },
          { path: "/confirm", element: <Confirm /> },
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
          { path: "mocks", element: <Mocks /> }, 
          { path: "users", element: <Users /> }, 
        ],
      },
    ],
  },
]);
 
