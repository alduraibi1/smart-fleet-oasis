
import * as React from "react"
import { LayoutDashboard, Users, Car, FileText, Settings } from "lucide-react"
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<"div">) {
  const location = useLocation();

  const menuItems = [
    {
      title: "لوحة التحكم",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "العملاء",
      url: "/customers",
      icon: Users,
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
      title: "الإعدادات",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          القائمة الرئيسية
        </h2>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "group flex w-full items-center space-x-2 rounded-md px-4 py-2 text-sm font-medium hover:underline",
                location.pathname === item.url
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
