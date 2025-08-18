
import { Home, Users, Car, FileText, Calculator, Settings, Wrench, Package, UserCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "العملاء", href: "/customers", icon: Users },
    { name: "الملاك", href: "/owners", icon: UserCheck },
    { name: "المركبات", href: "/vehicles", icon: Car },
    { name: "العقود", href: "/contracts", icon: FileText },
    { name: "المحاسبة", href: "/accounting", icon: Calculator },
    { name: "الصيانة", href: "/maintenance", icon: Wrench },
    { name: "المخزن", href: "/inventory", icon: Package },
    { name: "الموارد البشرية", href: "/hr", icon: UserCheck },
    { name: "إدارة النظام", href: "/system-management", icon: Settings },
  ];

  return (
    <div className="hidden border-r bg-background lg:block lg:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Car className="h-6 w-6" />
            <span>نظام إدارة المركبات</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    location.pathname === item.href &&
                      "bg-muted text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
