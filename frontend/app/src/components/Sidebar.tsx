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

const administratorRoutes =[
  {
    title: "Users",
    url: "/users",
    icon: User,
  }, 
]

export function AppSidebar() {
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

         <SidebarGroup>
          <SidebarGroupLabel>Administrator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {administratorRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
            <SidebarMenuItem>
               <Button variant="outline"><LogOut /></Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}