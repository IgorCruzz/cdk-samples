import { Home, User, FileJson2, LogOut} from "lucide-react"

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
  SidebarFooter
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import Logo from '@/assets/logo.png'
import { Button } from "./ui/button"
import { useAuthStore } from '@/store/use-auth'
   
const applicationRoutes = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Mocks",
    url: "/mocks",
    icon: FileJson2,
  },  
]

export function AppSidebar() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.getUser)

  const onLogout = () => {
    logout()
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarHeader className="mb-14">
            <Link to="/home">
              <img src={Logo} alt="Logo"  width={120} />
            </Link>
          </SidebarHeader>

          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {applicationRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> 
      </SidebarContent>


       <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
               <Button variant="outline" onClick={onLogout}><LogOut /></Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}