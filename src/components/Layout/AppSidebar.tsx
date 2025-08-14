
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Car, Calendar, Settings, Users, Database, 
  DollarSign, Home, BarChart3, TrendingUp, Building2, 
  Wrench, Shield, Bell, UserCheck, ChevronDown
} from 'lucide-react';
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MenuItem {
  title: string;
  icon: any;
  href: string;
  badge?: {
    count: number;
    variant: 'default' | 'secondary' | 'destructive';
  };
}

interface MenuSection {
  title: string;
  icon: any;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'الرئيسية',
    icon: Home,
    items: [
      {
        title: 'لوحة التحكم',
        icon: BarChart3,
        href: '/',
      }
    ]
  },
  {
    title: 'إدارة الأسطول',
    icon: Car,
    items: [
      {
        title: 'إدارة المركبات',
        icon: Car,
        href: '/vehicles',
        badge: { count: 12, variant: 'default' as const }
      },
      {
        title: 'العقود والإيجار',
        icon: Calendar,
        href: '/contracts',
        badge: { count: 5, variant: 'secondary' as const }
      },
      {
        title: 'العملاء',
        icon: Users,
        href: '/customers',
      },
      {
        title: 'إدارة الملاك',
        icon: UserCheck,
        href: '/owners',
      }
    ]
  },
  {
    title: 'الصيانة والمخزون',
    icon: Wrench,
    items: [
      {
        title: 'الصيانة',
        icon: Settings,
        href: '/maintenance',
        badge: { count: 3, variant: 'destructive' as const }
      },
      {
        title: 'المخزون وقطع الغيار',
        icon: Database,
        href: '/inventory',
        badge: { count: 8, variant: 'secondary' as const }
      },
      {
        title: 'الموردين',
        icon: Building2,
        href: '/suppliers',
      }
    ]
  },
  {
    title: 'المالية والإدارة',
    icon: Building2,
    items: [
      {
        title: 'النظام المحاسبي',
        icon: DollarSign,
        href: '/accounting',
      },
      {
        title: 'التقارير المالية',
        icon: TrendingUp,
        href: '/reports',
      },
      {
        title: 'الموارد البشرية',
        icon: Users,
        href: '/hr',
      }
    ]
  },
  {
    title: 'إدارة النظام',
    icon: Shield,
    items: [
      {
        title: 'إدارة النظام والصلاحيات',
        icon: Shield,
        href: '/system-management',
        badge: { count: 2, variant: 'secondary' as const }
      },
      {
        title: 'إعدادات الإشعارات',
        icon: Bell,
        href: '/notification-settings',
      }
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>([
    'الرئيسية', 'إدارة الأسطول', 'الصيانة والمخزون', 'المالية والإدارة', 'إدارة النظام'
  ]);

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar side="right" className="border-l">
      <SidebarHeader className="border-b p-4">
        <Logo size="lg" variant="glow" animated={true} />
      </SidebarHeader>

      <SidebarContent className="p-2">
        {menuSections.map((section) => (
          <SidebarGroup key={section.title}>
            <Collapsible
              open={openSections.includes(section.title)}
              onOpenChange={() => toggleSection(section.title)}
            >
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group/label w-full justify-between text-sm font-semibold hover:bg-accent rounded-md p-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/label:rotate-180" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.href)}
                          className="w-full justify-between"
                        >
                          <NavLink to={item.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {item.badge && (
                              <Badge 
                                variant={item.badge.variant}
                                className="text-xs"
                              >
                                {item.badge.count}
                              </Badge>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-destructive flex items-center justify-center">
              <Bell className="h-4 w-4 text-destructive-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">التنبيهات</span>
              <span className="text-xs text-muted-foreground">5 تنبيهات جديدة</span>
            </div>
          </div>
          <Badge variant="destructive" className="text-xs">
            5
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
