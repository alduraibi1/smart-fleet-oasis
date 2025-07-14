
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Car, Calendar, Settings, Users, Database, 
  DollarSign, Home, X, Bell, ChevronDown, ChevronLeft,
  BarChart3, PieChart, TrendingUp, Building2, Wrench, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const menuSections = [
  {
    title: 'الرئيسية',
    icon: Home,
    items: [
      {
        title: 'لوحة التحكم',
        icon: BarChart3,
        href: '/',
        badge: null
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
        badge: null
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
        badge: null
      },
      {
        title: 'التقارير المالية',
        icon: TrendingUp,
        href: '/reports',
        badge: null
      },
      {
        title: 'الموارد البشرية',
        icon: Users,
        href: '/hr',
        badge: null
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
      }
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'الرئيسية', 'إدارة الأسطول'
  ]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-72 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 lg:z-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex flex-col p-6 border-b border-border bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">
                CarRent Pro
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden h-8 w-8 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            نظام إدارة تأجير المركبات المتطور
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuSections.map((section) => {
            const isExpanded = expandedSections.includes(section.title);
            
            return (
              <div key={section.title} className="space-y-1">
                {/* Section Header */}
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "w-full justify-between h-10 px-3 rounded-lg",
                    "text-sm font-medium text-muted-foreground",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="space-y-1 pr-2">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                            "hover:bg-accent hover:text-accent-foreground",
                            "border border-transparent hover:border-border",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-sm border-primary/20" 
                              : "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge 
                              variant={item.badge.variant}
                              className="h-5 px-2 text-xs"
                            >
                              {item.badge.count}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Separator after each section except the last */}
                {section !== menuSections[menuSections.length - 1] && (
                  <Separator className="my-2" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">التنبيهات</span>
                <span className="text-xs text-muted-foreground">5 تنبيهات جديدة</span>
              </div>
            </div>
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              5
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}
