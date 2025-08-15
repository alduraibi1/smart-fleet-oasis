
import { lazy } from 'react';

// Lazy load components for better performance
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

// Define roles
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

// Define permissions
export type Permission = 
  | 'view_dashboard'
  | 'manage_vehicles'
  | 'manage_customers'
  | 'manage_contracts'
  | 'manage_maintenance'
  | 'view_reports'
  | 'manage_accounting'
  | 'manage_inventory'
  | 'manage_suppliers'
  | 'manage_hr'
  | 'manage_owners'
  | 'manage_system'
  | 'manage_notifications';

// Define protected routes with RBAC
export const protectedRoutes = [
  {
    path: '/',
    element: Index,
    title: 'الصفحة الرئيسية',
    description: 'نظرة عامة على النظام'
  },
  {
    path: '/dashboard',
    element: EnhancedDashboard,
    title: 'لوحة التحكم المتقدمة',
    description: 'إحصائيات وتحليلات شاملة',
    requiredPermission: 'view_dashboard'
  },
  {
    path: '/vehicles',
    element: Vehicles,
    title: 'إدارة المركبات',
    description: 'عرض وإدارة المركبات',
    requiredPermission: 'manage_vehicles'
  },
  {
    path: '/contracts',
    element: ContractsMain,
    title: 'إدارة العقود',
    description: 'عرض وإدارة عقود الإيجار',
    requiredPermission: 'manage_contracts'
  },
  {
    path: '/maintenance',
    element: Maintenance,
    title: 'إدارة الصيانة',
    description: 'عرض وإدارة عمليات الصيانة',
    requiredPermission: 'manage_maintenance'
  },
  {
    path: '/reports',
    element: EnhancedReports,
    title: 'التقارير المتقدمة',
    description: 'تقارير شاملة وتحليلات',
    requiredPermission: 'view_reports'
  },
  {
    path: '/accounting',
    element: Accounting,
    title: 'المحاسبة',
    description: 'إدارة الحسابات والمالية',
    requiredPermission: 'manage_accounting'
  },
  {
    path: '/financial-control',
    element: FinancialControl,
    title: 'الرقابة المالية',
    description: 'مراقبة وتحليل الأداء المالي',
    requiredPermission: 'manage_accounting'
  },
  {
    path: '/inventory',
    element: Inventory,
    title: 'إدارة المخزون',
    description: 'عرض وإدارة المخزون',
    requiredPermission: 'manage_inventory'
  },
  {
    path: '/suppliers',
    element: Suppliers,
    title: 'إدارة الموردين',
    description: 'عرض وإدارة الموردين',
    requiredPermission: 'manage_suppliers'
  },
  {
    path: '/hr',
    element: EnhancedHR,
    title: 'إدارة الموارد البشرية',
    description: 'إدارة الموظفين والحضور',
    requiredPermission: 'manage_hr'
  },
  {
    path: '/owners',
    element: Owners,
    title: 'إدارة الملاك',
    description: 'عرض وإدارة ملاك المركبات',
    requiredPermission: 'manage_owners'
  },
  {
    path: '/system',
    element: SystemManagement,
    title: 'إدارة النظام',
    description: 'إعدادات النظام والمستخدمين',
    requiredRole: 'admin',
    requiredPermission: 'manage_system'
  },
  {
    path: '/notifications',
    element: NotificationSettings,
    title: 'إعدادات الإشعارات',
    description: 'إدارة إعدادات الإشعارات',
    requiredPermission: 'manage_notifications'
  }
];

// Role-based permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_vehicles',
    'manage_customers',
    'manage_contracts',
    'manage_maintenance',
    'view_reports',
    'manage_accounting',
    'manage_inventory',
    'manage_suppliers',
    'manage_hr',
    'manage_owners',
    'manage_system',
    'manage_notifications'
  ],
  manager: [
    'view_dashboard',
    'manage_vehicles',
    'manage_customers',
    'manage_contracts',
    'manage_maintenance',
    'view_reports',
    'manage_accounting',
    'manage_inventory',
    'manage_suppliers',
    'manage_hr',
    'manage_owners',
    'manage_notifications'
  ],
  employee: [
    'view_dashboard',
    'manage_vehicles',
    'manage_customers',
    'manage_contracts',
    'manage_maintenance',
    'view_reports'
  ],
  viewer: [
    'view_dashboard',
    'view_reports'
  ]
};

// Check if user has specific permission
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) ?? false;
};

// Check if user has required role
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    employee: 2,
    manager: 3,
    admin: 4
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
