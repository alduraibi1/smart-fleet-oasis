
import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { File, FileText, GraduationCap, LayoutDashboard, ListChecks, MessageSquare, Settings, User, Users, Car } from "lucide-react"
import { Sidebar } from "lucide-react"
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
      title: "العقود الأساسية",
      url: "/contracts-essential",
      icon: FileText,
    },
    {
      title: "العقود البسيطة",
      url: "/contracts-simple",
      icon: File,
    },
    {
      title: "العقود المحسنة",
      url: "/contracts-optimized",
      icon: ListChecks,
    },
    {
      title: "العقود المتقدمة",
      url: "/contracts-advanced",
      icon: FileText,
    },
    {
      title: "المستخدمين",
      url: "/users",
      icon: User,
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
