
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

type Permission = 
  | 'dashboard.read' | 'dashboard.write' | 'dashboard.delete'
  | 'vehicles.read' | 'vehicles.write' | 'vehicles.delete'
  | 'contracts.read' | 'contracts.write' | 'contracts.delete'
  | 'customers.read' | 'customers.write' | 'customers.delete'
  | 'maintenance.read' | 'maintenance.write' | 'maintenance.delete'
  | 'inventory.read' | 'inventory.write' | 'inventory.delete'
  | 'accounting.read' | 'accounting.write' | 'accounting.delete'
  | 'reports.read' | 'reports.write' | 'reports.delete'
  | 'system.read' | 'system.write' | 'system.delete';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  children, 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = true; // No restrictions
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
