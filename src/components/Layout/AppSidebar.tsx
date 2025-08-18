
import { Car, Users, FileText, BarChart3, Settings, Wrench, Package, Building2, Home, Calculator } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "الرئيسية",
    icon: Home,
    url: "/",
    category: "main"
  },
  {
    title: "العملاء",
    icon: Users,
    url: "/customers",
    category: "operations"
  },
  {
    title: "ملاك المركبات",
    icon: Building2,
    url: "/owners",
    category: "operations"
  },
  {
    title: "المركبات",
    icon: Car,
    url: "/vehicles",
    category: "operations"
  },
  {
    title: "العقود",
    icon: FileText,
    url: "/contracts",
    category: "operations"
  },
  {
    title: "الصيانة",
    icon: Wrench,
    url: "/maintenance",
    category: "maintenance"
  },
  {
    title: "المخزون",
    icon: Package,
    url: "/inventory",
    category: "maintenance"
  },
  {
    title: "المحاسبة",
    icon: Calculator,
    url: "/accounting",
    category: "financial"
  },
  {
    title: "التقارير",
    icon: BarChart3,
    url: "/reports",
    category: "financial"
  },
  {
    title: "إدارة النظام",
    icon: Settings,
    url: "/system-management",
    category: "admin"
  },
];

const categoryLabels = {
  main: "الرئيسية",
  operations: "العمليات التشغيلية",
  maintenance: "الصيانة والمخزون", 
  financial: "المالية والتقارير",
  admin: "إدارة النظام"
};

export function AppSidebar() {
  const location = useLocation();

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <Sidebar>
      <SidebarContent>
        {Object.entries(groupedItems).map(([category, items]) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel>{categoryLabels[category as keyof typeof categoryLabels]}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
