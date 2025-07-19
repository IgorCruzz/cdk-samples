import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Logo from '@/assets/logo.png';
import { useAuthStore } from "@/store/use-auth";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function AppSidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `block text-white p-2 rounded transition-colors duration-300 ${
      isActive(path)
        ? 'bg-gradient-to-r from-green-300/70 to-green-500/70 hover:from-green-600/70 hover:to-green-800/70'
        : 'hover:bg-green-900/30'
    }`;

  return (
    <Sidebar>
      <SidebarHeader className="items-center justify-center gap-5">
        <img src={Logo} alt="Logo" width={100} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <ul className="w-full space-y-2">
            <li>
              <Link to="/home" className={linkClass('/home')}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/upload" className={linkClass('/upload')}>
                Upload
              </Link>
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
