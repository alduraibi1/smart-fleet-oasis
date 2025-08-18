
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
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Users, 
  Car, 
  FileText, 
  Calculator,
  BarChart3,
  Settings,
  UserCheck
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Logo } from "@/components/ui/logo"

const menuItems = [
  {
    title: "الرئيسية",
    url: "/",
    icon: Home,
  },
  {
    title: "العملاء",
    url: "/customers",
    icon: Users,
  },
  {
    title: "مالكي السيارات",
    url: "/owners",
    icon: UserCheck,
  },
  {
    title: "المركبات",
    url: "/vehicles",
    icon: Car,
  },
  {
    title: "العقود",
    url: "/contracts",
    icon: FileText,
  },
  {
    title: "المحاسبة",
    url: "/accounting",
    icon: Calculator,
  },
  {
    title: "التقارير",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "إدارة النظام",
    url: "/system-management",
    icon: Settings,
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <Logo size="sm" showText={true} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
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
      <SidebarRail />
    </Sidebar>
  )
}
