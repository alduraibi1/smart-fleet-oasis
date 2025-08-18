
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { 
  Car, 
  Users, 
  FileText, 
  Wrench, 
  Calculator, 
  Shield,
  BarChart3, 
  Building, 
  Package, 
  Briefcase,
  Settings,
  Zap,
  Bell
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const navigationItems = [
  { title: "الرئيسية", url: "/", icon: BarChart3 },
  { title: "المركبات", url: "/vehicles", icon: Car },
  { title: "العملاء", url: "/customers", icon: Users },
  { title: "العقود", url: "/contracts", icon: FileText },
  { title: "الصيانة", url: "/maintenance", icon: Wrench },
  { title: "المحاسبة", url: "/accounting", icon: Calculator },
  { title: "الرقابة المالية", url: "/financial-control", icon: Shield },
  { title: "التقارير", url: "/reports", icon: BarChart3 },
  { title: "الملاك", url: "/owners", icon: Building },
  { title: "الموردين", url: "/suppliers", icon: Package },
  { title: "المخزون", url: "/inventory", icon: Package },
  { title: "الموارد البشرية", url: "/hr", icon: Briefcase },
  { title: "إدارة النظام", url: "/system-management", icon: Settings },
  { title: "تحسين النظام", url: "/system-optimization", icon: Zap },
  { title: "إعدادات الإشعارات", url: "/notification-settings", icon: Bell },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">نظام إدارة تأجير المركبات</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.url
            
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link to={item.url} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
