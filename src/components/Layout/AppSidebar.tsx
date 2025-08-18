
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
  useSidebar,
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
  const { state } = useSidebar()

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border/50 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60"
    >
      <SidebarHeader className="p-3 md:p-4 border-b border-border/30">
        <Logo size="sm" showText={state === "expanded"} />
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/70 mb-2">
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="h-10 px-3 rounded-lg hover:bg-sidebar-accent/80 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate font-medium">{item.title}</span>
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
