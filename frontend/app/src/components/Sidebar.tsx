import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Logo from '@/assets/logo.png';
import { useAuthStore } from "@/store/use-auth";
import { Link } from "react-router-dom"; 
import { Button } from "./ui/button";

export function AppSidebar() {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout(); 
  };

  return (
    <Sidebar>
      <SidebarHeader className="items-center justify-center gap-5">
        <img src={Logo} alt="Logo" width={100}/>
        <p>Bem vindo, Igor</p> 
      </SidebarHeader> 

      <SidebarContent>
        <SidebarGroup> 
          <ul className="mt-2 space-y-2">
            <li className="text-white p-2 bg-gradient-to-r from-green-300/70 to-green-500/70 hover:from-green-600/70 hover:to-green-800/70 cursor-pointer transition-colors duration-300 rounded">
  <Link to="/home">Home</Link>
</li>


          </ul>
        </SidebarGroup> 
      </SidebarContent> 

      <SidebarFooter>        
        <Button onClick={handleLogout} className="bg-transparent w-full text-white p-2 rounded">
          Logout
        </Button>
      </SidebarFooter>  
    </Sidebar>
  )
}