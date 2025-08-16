import { useState } from 'react';
import { Home, FileJson2, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import Logo from '@/assets/logo.png';
import { Button } from './ui/button';
import { useAuthStore } from '@/store/use-auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Avatar from 'react-avatar';

const applicationRoutes = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Mocks', url: '/mocks', icon: FileJson2 },
];

export function AppSidebar() {
  const logout = useAuthStore((state) => state.logout);
  const getUser = useAuthStore((state) => state.getUser);
  const user = getUser();

  const location = useLocation(); // hook para pegar rota atual
  const [collapsed, setCollapsed] = useState(false);

  const onLogout = () => logout();

  return (
    <Sidebar
      className={`transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-40'
      } h-[95vh] overflow-hidden rounded-2xl shadow-lg m-4`}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader
            className={`mb-14 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}
          >
            {!collapsed && (
              <Link to="/home">
                <img src={Logo} alt="Logo" width={120} />
              </Link>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? '▶' : '◀'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{collapsed ? 'Expandir' : 'Recolher'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarHeader>

          {!collapsed && <SidebarGroupLabel>Application</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              {applicationRoutes.map((item) => {
                const isActive = location.pathname === item.url; // verifica se está na página
                return (
                  <SidebarMenuItem key={item.title}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link
                              to={item.url}
                              className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 ${
                                isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span
                                className={`transition-opacity duration-200 ${
                                  collapsed ? 'opacity-0 w-0' : 'opacity-100'
                                }`}
                              >
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right" className="ml-2">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem
            className={`w-full p-2 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            {!collapsed && (
              <p>
                <Avatar name={`${user.given_name} ${user.family_name}`} size="40" round={true} />
              </p>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={onLogout}>
                    <LogOut />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
