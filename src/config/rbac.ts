
import { lazy } from 'react';

// Lazy load all pages
const Index = lazy(() => import('@/pages/Index'));
const EnhancedDashboard = lazy(() => import('@/pages/EnhancedDashboard'));
const Vehicles = lazy(() => import('@/pages/Vehicles'));
const ContractsMain = lazy(() => import('@/pages/ContractsMain'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const EnhancedReports = lazy(() => import('@/pages/EnhancedReports'));
const Accounting = lazy(() => import('@/pages/Accounting'));
const FinancialControl = lazy(() => import('@/pages/FinancialControl'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const Suppliers = lazy(() => import('@/pages/Suppliers'));
const EnhancedHR = lazy(() => import('@/pages/EnhancedHR'));
const Owners = lazy(() => import('@/pages/Owners'));
const SystemManagement = lazy(() => import('@/pages/SystemManagement'));
const NotificationSettings = lazy(() => import('@/pages/NotificationSettings'));

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiredRole?: string;
  requiredPermission?: string;
  title: string;
  description?: string;
}

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/',
    element: Index,
    title: 'الصفحة الرئيسية',
    description: 'لوحة التحكم الرئيسية'
  },
  {
    path: '/enhanced-dashboard',
    element: EnhancedDashboard,
    title: 'لوحة التحكم المتقدمة',
    description: 'إحصائيات وتحليلات متقدمة'
  },
  {
    path: '/vehicles',
    element: Vehicles,
    title: 'إدارة المركبات',
    description: 'عرض وإدارة المركبات'
  },
  {
    path: '/contracts',
    element: ContractsMain,
    title: 'إدارة العقود',
    description: 'عرض وإدارة عقود الإيجار'
  },
  {
    path: '/maintenance',
    element: Maintenance,
    title: 'الصيانة',
    description: 'إدارة صيانة المركبات'
  },
  {
    path: '/reports',
    element: EnhancedReports,
    title: 'التقارير',
    description: 'التقارير والإحصائيات'
  },
  {
    path: '/accounting',
    element: Accounting,
    requiredRole: 'accountant',
    title: 'المحاسبة',
    description: 'إدارة الحسابات والمالية'
  },
  {
    path: '/financial-control',
    element: FinancialControl,
    requiredRole: 'manager',
    title: 'الرقابة المالية',
    description: 'مراقبة الأداء المالي'
  },
  {
    path: '/inventory',
    element: Inventory,
    title: 'المخزون',
    description: 'إدارة المخزون والقطع'
  },
  {
    path: '/suppliers',
    element: Suppliers,
    title: 'الموردين',
    description: 'إدارة الموردين'
  },
  {
    path: '/hr',
    element: EnhancedHR,
    requiredRole: 'manager',
    title: 'الموارد البشرية',
    description: 'إدارة الموظفين'
  },
  {
    path: '/owners',
    element: Owners,
    title: 'الملاك',
    description: 'إدارة ملاك المركبات'
  },
  {
    path: '/system-management',
    element: SystemManagement,
    requiredRole: 'admin',
    title: 'إدارة النظام',
    description: 'إعدادات النظام والصلاحيات'
  },
  {
    path: '/notification-settings',
    element: NotificationSettings,
    title: 'إعدادات الإشعارات',
    description: 'تخصيص الإشعارات'
  }
];

// Get user's accessible routes based on their roles
export const getAccessibleRoutes = (userRoles: string[]) => {
  return protectedRoutes.filter(route => {
    if (!route.requiredRole) return true;
    return userRoles.includes(route.requiredRole) || userRoles.includes('admin');
  });
};
