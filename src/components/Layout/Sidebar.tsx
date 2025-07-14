
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
    'الرئيسية', 'إدارة الأسطول', 'إدارة النظام'
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
        <nav 
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent',
          }}
        >
          <style>{`
            nav::-webkit-scrollbar {
              width: 8px;
            }
            nav::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 10px;
              margin: 8px 0;
            }
            nav::-webkit-scrollbar-thumb {
              background: hsl(var(--muted-foreground) / 0.3);
              border-radius: 10px;
              transition: all 0.3s ease;
              border: 1px solid transparent;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: hsl(var(--muted-foreground) / 0.5);
              transform: scaleY(1.1);
            }
            nav::-webkit-scrollbar-thumb:active {
              background: hsl(var(--primary) / 0.6);
            }
            nav::-webkit-scrollbar-corner {
              background: transparent;
            }
          `}</style>
          {menuSections.map((section, sectionIndex) => {
            const isExpanded = expandedSections.includes(section.title);
            
            return (
              <div key={section.title} className="space-y-2">
                {/* Section Header */}
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "w-full justify-between h-11 px-4 rounded-xl",
                    "text-sm font-semibold transition-all duration-300",
                    "hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md",
                    "border border-transparent hover:border-border/50",
                    isExpanded 
                      ? "bg-accent/50 text-accent-foreground shadow-sm" 
                      : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors duration-300",
                      isExpanded ? "bg-primary/20 text-primary" : "bg-muted/50"
                    )}>
                      <section.icon className="h-4 w-4" />
                    </div>
                    <span>{section.title}</span>
                  </div>
                  <div className={cn(
                    "transition-transform duration-300",
                    isExpanded ? "rotate-180" : "rotate-0"
                  )}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>

                {/* Section Items */}
                <div className={cn(
                  "space-y-1 transition-all duration-300 overflow-hidden",
                  isExpanded 
                    ? "max-h-96 opacity-100 pr-2" 
                    : "max-h-0 opacity-0"
                )}>
                  {section.items.map((item, itemIndex) => {
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-3 rounded-xl",
                          "transition-all duration-300 transform hover:scale-[1.02]",
                          "hover:bg-accent/60 hover:text-accent-foreground hover:shadow-md",
                          "border border-transparent hover:border-border/30",
                          "group relative overflow-hidden",
                          isActive 
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg border-primary/20 scale-[1.02]" 
                            : "text-muted-foreground"
                        )}
                        style={{
                          animationDelay: `${itemIndex * 50}ms`
                        }}
                      >
                        {/* Background animation */}
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5",
                          "transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100",
                          "origin-left"
                        )} />
                        
                        <div className="flex items-center gap-3 relative z-10">
                          <div className={cn(
                            "p-1.5 rounded-lg transition-all duration-300",
                            isActive 
                              ? "bg-white/20 text-white shadow-sm" 
                              : "bg-muted/30 group-hover:bg-primary/20 group-hover:text-primary"
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        
                        {item.badge && (
                          <Badge 
                            variant={isActive ? "secondary" : item.badge.variant}
                            className={cn(
                              "h-6 px-2.5 text-xs font-semibold transition-all duration-300 relative z-10",
                              isActive 
                                ? "bg-white/20 text-white border-white/30" 
                                : "shadow-sm"
                            )}
                          >
                            {item.badge.count}
                          </Badge>
                        )}
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/40 rounded-r-full" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Separator after each section except the last */}
                {sectionIndex !== menuSections.length - 1 && (
                  <div className="relative">
                    <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-muted rounded-full" />
                    </div>
                  </div>
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
