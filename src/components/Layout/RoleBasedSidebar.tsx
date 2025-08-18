
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
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "الرئيسية",
    icon: Home,
    url: "/",
    category: "main",
    requiredRole: null
  },
  {
    title: "العملاء",
    icon: Users,
    url: "/customers",
    category: "operations",
    requiredRole: "employee"
  },
  {
    title: "ملاك المركبات",
    icon: Building2,
    url: "/owners",
    category: "operations",
    requiredRole: "employee"
  },
  {
    title: "المركبات",
    icon: Car,
    url: "/vehicles",
    category: "operations",
    requiredRole: "employee"
  },
  {
    title: "العقود",
    icon: FileText,
    url: "/contracts",
    category: "operations",
    requiredRole: "employee"
  },
  {
    title: "الصيانة",
    icon: Wrench,
    url: "/maintenance",
    category: "maintenance",
    requiredRole: "employee"
  },
  {
    title: "المخزون",
    icon: Package,
    url: "/inventory",
    category: "maintenance",
    requiredRole: "employee"
  },
  {
    title: "المحاسبة",
    icon: Calculator,
    url: "/accounting",
    category: "financial",
    requiredRole: "accountant"
  },
  {
    title: "التقارير",
    icon: BarChart3,
    url: "/reports",
    category: "financial",
    requiredRole: "manager"
  },
  {
    title: "إدارة النظام",
    icon: Settings,
    url: "/system-management",
    category: "admin",
    requiredRole: "admin"
  },
];

const categoryLabels = {
  main: "الرئيسية",
  operations: "العمليات التشغيلية",
  maintenance: "الصيانة والمخزون", 
  financial: "المالية والتقارير",
  admin: "إدارة النظام"
};

export function RoleBasedSidebar() {
  const location = useLocation();
  const { hasRole } = useAuth();

  // Filter menu items based on user roles
  const filteredItems = menuItems.filter(item => {
    if (!item.requiredRole) return true;
    return hasRole(item.requiredRole) || hasRole('admin'); // Admins can access everything
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
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
