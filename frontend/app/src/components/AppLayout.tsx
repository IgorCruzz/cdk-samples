import { Outlet } from "react-router-dom"; 
import {AppSidebar} from "./Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const AppLayout = () => { 
  return (
  <div className="min-h-screen flex flex-col justify-between">

    








    

  <SidebarProvider>
  <AppSidebar />
    <SidebarTrigger />
  <main className="flex-1 p-5">
  
      <Outlet />
  </main>
</SidebarProvider>  
</div>

  );
};

export default AppLayout;
