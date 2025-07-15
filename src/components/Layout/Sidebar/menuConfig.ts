import {
  Car, Calendar, Settings, Users, Database, 
  DollarSign, Home, BarChart3, TrendingUp, Building2, Wrench, Shield, Bell, UserCheck
} from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: any;
  href: string;
  badge?: {
    count: number;
    variant: 'default' | 'secondary' | 'destructive';
  };
}

export interface MenuSection {
  title: string;
  icon: any;
  items: MenuItem[];
}

export const menuSections: MenuSection[] = [
  {
    title: 'الرئيسية',
    icon: Home,
    items: [
      {
        title: 'لوحة التحكم',
        icon: BarChart3,
        href: '/',
        badge: undefined
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
        badge: undefined
      },
      {
        title: 'إدارة الملاك',
        icon: UserCheck,
        href: '/owners',
        badge: undefined
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
        badge: undefined
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
        badge: undefined
      },
      {
        title: 'التقارير المالية',
        icon: TrendingUp,
        href: '/reports',
        badge: undefined
      },
      {
        title: 'الموارد البشرية',
        icon: Users,
        href: '/hr',
        badge: undefined
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
        badge: undefined
      }
    ]
  }
];