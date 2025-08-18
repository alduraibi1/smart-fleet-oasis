
import { useAuth } from './useAuth';

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

export function usePermissions() {
  const { hasPermissionSync, hasRole } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    // Admins have all permissions
    if (hasRole('admin')) return true;
    
    return hasPermissionSync(permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (hasRole('admin')) return true;
    
    return permissions.some(permission => hasPermissionSync(permission));
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (hasRole('admin')) return true;
    
    return permissions.every(permission => hasPermissionSync(permission));
  };

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
  };
}
