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
import { useLocation } from 'react-router-dom';

export function AppSidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };
 
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader className="items-center justify-center gap-5">
        <img src={Logo} alt="Logo" width={100} />
        <p>Bem vindo</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <ul className="mt-2 space-y-2 w-full">
            <li
              className={`text-white p-2 rounded transition-colors duration-300 cursor-pointer ${
                isActive('/home')
                  ? 'bg-gradient-to-r from-green-300/70 to-green-500/70 hover:from-green-600/70 hover:to-green-800/70'
                  : 'hover:bg-green-900/30'
              }`}
            >
              <Link to="/home">Home</Link>
            </li>

            <li
              className={`text-white p-2 rounded transition-colors duration-300 cursor-pointer ${
                isActive('/upload')
                  ? 'bg-gradient-to-r from-green-300/70 to-green-500/70 hover:from-green-600/70 hover:to-green-800/70'
                  : 'hover:bg-green-900/30'
              }`}
            >
              <Link to="/upload">Upload</Link>
            </li>
          </ul>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          onClick={handleLogout}
          className="bg-transparent w-full text-white p-2 rounded"
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
