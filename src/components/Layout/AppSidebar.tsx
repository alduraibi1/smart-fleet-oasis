
import { useState } from "react";
import {
  Home,
  Car,
  Users,
  FileText,
  Settings,
  DollarSign,
  Package,
  Wrench,
  TrendingUp,
  UserCheck,
  Building,
  ChevronDown,
  TestTube
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Main navigation items
const mainItems = [
  { title: "الرئيسية", url: "/", icon: Home },
  { title: "المركبات", url: "/vehicles", icon: Car },
  { title: "العملاء", url: "/customers", icon: Users },
  { title: "الملاك", url: "/owners", icon: Building },
];

// Contracts submenu items
const contractItems = [
  { title: "العقود الرئيسية", url: "/contracts-main" },
  { title: "العقود البسيطة", url: "/contracts-simple" },
  { title: "العقود المحسنة", url: "/contracts-optimized" },
  { title: "العقود الأساسية", url: "/contracts-essential" },
  { title: "العقود (قديم)", url: "/contracts" },
];

// Operations items
const operationItems = [
  { title: "الصيانة", url: "/maintenance", icon: Wrench },
  { title: "المخزون", url: "/inventory", icon: Package },
  { title: "الموردين", url: "/suppliers", icon: Building },
];

// Management items
const managementItems = [
  { title: "المحاسبة", url: "/accounting", icon: DollarSign },
  { title: "التقارير", url: "/reports", icon: TrendingUp },
  { title: "الموارد البشرية", url: "/hr", icon: UserCheck },
];

// System items
const systemItems = [
  { title: "فحص النظام", url: "/system-check", icon: TestTube },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [contractsOpen, setContractsOpen] = useState(
    contractItems.some(item => currentPath === item.url)
  );

  // Helper functions
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const isCollapsed = state === "collapsed";

  return (
    <>
      <SidebarTrigger className="fixed top-4 right-4 z-50 md:hidden" />
      
      <Sidebar
        className={isCollapsed ? "w-14" : "w-60"}
        collapsible="icon"
      >
        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>التنقل الرئيسي</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="ml-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Contracts Section */}
          <SidebarGroup>
            <SidebarGroupLabel>العقود</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible open={contractsOpen} onOpenChange={setContractsOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <FileText className="ml-2 h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span>إدارة العقود</span>
                            <ChevronDown className="mr-auto h-4 w-4 transition-transform duration-200" 
                              style={{ transform: contractsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="mr-4">
                        {contractItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                              <NavLink to={item.url} className={getNavCls}>
                                {!isCollapsed && <span className="text-sm">{item.title}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Operations */}
          <SidebarGroup>
            <SidebarGroupLabel>العمليات</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {operationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="ml-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Management */}
          <SidebarGroup>
            <SidebarGroupLabel>الإدارة</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="ml-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* System */}
          <SidebarGroup>
            <SidebarGroupLabel>النظام</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="ml-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
