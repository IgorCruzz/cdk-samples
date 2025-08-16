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
import { Link } from 'react-router-dom';
import Logo from '@/assets/logo.png';
import { Button } from './ui/button';
import { useAuthStore } from '@/store/use-auth';

const applicationRoutes = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Mocks', url: '/mocks', icon: FileJson2 },
];

export function AppSidebar() {
  const logout = useAuthStore((state) => state.logout);
  const getUser = useAuthStore((state) => state.getUser);
  const user = getUser();

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
          <SidebarHeader className={`mb-14 flex items-center justify-between ${collapsed ? 'px-2' : 'px-4'}`}>
            {!collapsed && (
              <Link to="/home">
                <img src={Logo} alt="Logo" width={120} />
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '»' : '«'}
            </Button>
          </SidebarHeader>

          {!collapsed && <SidebarGroupLabel>Application</SidebarGroupLabel>}

          <SidebarGroupContent>
            <SidebarMenu>
              {applicationRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span
                        className={`transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className={`w-full p-2 bg-zinc-900 flex items-center justify-between`}>
            {!collapsed && (
              <p>
                {user.given_name} {user.family_name}
              </p>
            )}
            <Button variant="outline" onClick={onLogout}>
              <LogOut />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
