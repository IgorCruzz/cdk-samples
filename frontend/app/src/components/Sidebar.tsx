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
            <li className="text-white p-2  bg-gray-800 hover:bg-gray-700 cursor-pointer">
              <Link to="/home">Home</Link>
            </li> 
          </ul>
        </SidebarGroup> 
      </SidebarContent> 

      <SidebarFooter>
        <button onClick={handleLogout} className="w-ful text-white p-2 rounded">
          Logout
        </button>
      </SidebarFooter>  
    </Sidebar>
  )
}