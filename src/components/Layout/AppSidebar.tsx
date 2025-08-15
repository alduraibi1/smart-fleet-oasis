
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Car, 
  FileText, 
  Wrench, 
  BarChart3, 
  Calculator,
  TrendingUp,
  Package,
  Truck,
  Users,
  UserCheck,
  Settings,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, hasRole } from "@/config/rbac";

const sidebarItems = [
  {
    title: "الصفحة الرئيسية",
    href: "/",
    icon: LayoutDashboard,
    permission: null
  },
  {
    title: "لوحة التحكم",
    href: "/dashboard",
    icon: BarChart3,
    permission: "view_dashboard" as const
  },
  {
    title: "المركبات",
    href: "/vehicles",
    icon: Car,
    permission: "manage_vehicles" as const
  },
  {
    title: "العقود",
    href: "/contracts",
    icon: FileText,
    permission: "manage_contracts" as const
  },
  {
    title: "الصيانة",
    href: "/maintenance",
    icon: Wrench,
    permission: "manage_maintenance" as const
  },
  {
    title: "التقارير",
    href: "/reports",
    icon: BarChart3,
    permission: "view_reports" as const
  },
  {
    title: "المحاسبة",
    href: "/accounting",
    icon: Calculator,
    permission: "manage_accounting" as const
  },
  {
    title: "الرقابة المالية",
    href: "/financial-control",
    icon: TrendingUp,
    permission: "manage_accounting" as const
  },
  {
    title: "المخزون",
    href: "/inventory",
    icon: Package,
    permission: "manage_inventory" as const
  },
  {
    title: "الموردين",
    href: "/suppliers",
    icon: Truck,
    permission: "manage_suppliers" as const
  },
  {
    title: "الموارد البشرية",
    href: "/hr",
    icon: Users,
    permission: "manage_hr" as const
  },
  {
    title: "الملاك",
    href: "/owners",
    icon: UserCheck,
    permission: "manage_owners" as const
  },
  {
    title: "إدارة النظام",
    href: "/system",
    icon: Settings,
    permission: "manage_system" as const,
    requiredRole: "admin" as const
  },
  {
    title: "الإشعارات",
    href: "/notifications",
    icon: Bell,
    permission: "manage_notifications" as const
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { user, userRole } = useAuth();

  const isItemVisible = (item: typeof sidebarItems[0]) => {
    if (!user) return false;
    
    // Check role requirement first
    if (item.requiredRole && !hasRole(userRole, item.requiredRole)) {
      return false;
    }
    
    // Check permission requirement
    if (item.permission && !hasPermission(userRole, item.permission)) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">نظام إدارة الإيجار</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {sidebarItems.map((item, index) => {
            if (!isItemVisible(item)) return null;
            
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-10",
                  isActive && "bg-primary text-primary-foreground"
                )}
                asChild
              >
                <Link to={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <div className="text-sm text-muted-foreground">
          مرحباً، {user?.email}
        </div>
        <div className="text-xs text-muted-foreground">
          الدور: {userRole === 'admin' ? 'مدير' : userRole === 'manager' ? 'مشرف' : userRole === 'employee' ? 'موظف' : 'مشاهد'}
        </div>
      </div>
    </div>
  );
}
