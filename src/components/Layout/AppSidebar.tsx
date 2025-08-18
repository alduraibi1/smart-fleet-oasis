
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Users, 
  Car, 
  FileText, 
  Calculator,
  BarChart3,
  PieChart,
  Settings,
  UserCheck
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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
    title: "التقارير المتقدمة",
    url: "/advanced-reports",
    icon: PieChart,
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
    <Sidebar>
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
    </Sidebar>
  )
}
