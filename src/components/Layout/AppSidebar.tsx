
import React from "react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Home,
  Car,
  Users,
  UserCheck,
  FileText,
  Wrench,
  BarChart3,
  Calculator,
  TrendingUp,
  Building2,
  Package,
  Truck,
  Settings,
  Bell,
  Activity
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const data = {
  navMain: [
    {
      title: "الرئيسية",
      url: "/",
      icon: Home,
    },
    {
      title: "لوحة التحكم المتقدمة",
      url: "/enhanced-dashboard", 
      icon: Activity,
    },
    {
      title: "المركبات",
      url: "/vehicles",
      icon: Car,
    },
    {
      title: "الملاك",
      url: "/owners",
      icon: Users,
    },
    {
      title: "العملاء",
      url: "/customers",
      icon: UserCheck,
    },
    {
      title: "العقود",
      url: "/contracts",
      icon: FileText,
    },
    {
      title: "الصيانة",
      url: "/maintenance",
      icon: Wrench,
    },
    {
      title: "التقارير",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "المحاسبة",
      url: "/accounting",
      icon: Calculator,
    },
    {
      title: "تقارير الربحية",
      url: "/profitability-reports",
      icon: TrendingUp,
    },
    {
      title: "الموارد البشرية",
      url: "/hr",
      icon: Building2,
    },
    {
      title: "المخزون",
      url: "/inventory",
      icon: Package,
    },
    {
      title: "الموردون",
      url: "/suppliers",
      icon: Truck,
    },
    {
      title: "إدارة النظام",
      url: "/system",
      icon: Settings,
    },
    {
      title: "إعدادات التنبيهات",
      url: "/notification-settings",
      icon: Bell,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        location.pathname === item.url
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
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
  );
}
