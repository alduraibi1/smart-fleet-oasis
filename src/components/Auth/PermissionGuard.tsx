
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Permission = 
  | 'dashboard.read' | 'dashboard.write' | 'dashboard.delete'
  | 'vehicles.read' | 'vehicles.write' | 'vehicles.delete'
  | 'contracts.read' | 'contracts.write' | 'contracts.delete'
  | 'customers.read' | 'customers.write' | 'customers.delete'
  | 'maintenance.read' | 'maintenance.write' | 'maintenance.delete'
  | 'inventory.read' | 'inventory.write' | 'inventory.delete'
  | 'accounting.read' | 'accounting.write' | 'accounting.delete'
  | 'reports.read' | 'reports.write' | 'reports.delete'
  | 'system.read' | 'system.write' | 'system.delete'
  | 'admin.system' | 'admin.security' | 'admin.users';

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
  const { loading, user, error, refreshPermissions, userProfile } = useAuth();

  // عرض خطأ في جلب الصلاحيات
  if (error && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">خطأ في تحميل الصلاحيات</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={refreshPermissions}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </Card>
      </div>
    );
  }

  // Check if user account is pending approval
  if (userProfile?.approval_status === 'pending') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <div className="p-6 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h3 className="text-lg font-semibold mb-2">في انتظار الموافقة</h3>
          <p className="text-muted-foreground mb-4">
            تم إرسال طلب التسجيل الخاص بك. سيتم مراجعته من قبل الإدارة وستتلقى إشعاراً عند الموافقة عليه.
          </p>
          <Badge variant="secondary" className="mb-4">
            حالة الحساب: في الانتظار
          </Badge>
          <div className="text-sm text-muted-foreground">
            إذا كان لديك أي استفسار، يرجى التواصل مع الإدارة
          </div>
        </div>
      </Card>
    );
  }

  // Check if user account was rejected
  if (userProfile?.approval_status === 'rejected') {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold mb-2">تم رفض الطلب</h3>
          <p className="text-muted-foreground mb-4">
            عذراً، تم رفض طلب التسجيل الخاص بك.
          </p>
          <Badge variant="destructive" className="mb-4">
            حالة الحساب: مرفوض
          </Badge>
          {userProfile.rejection_reason && (
            <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded">
              <strong>سبب الرفض:</strong><br />
              {userProfile.rejection_reason}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            يمكنك إنشاء حساب جديد أو التواصل مع الإدارة للمزيد من المعلومات
          </div>
        </div>
      </Card>
    );
  }

  // عرض loader أثناء التحميل
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </Card>
      </div>
    );
  }

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

  // عرض رسالة عدم وجود صلاحية
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="p-8 text-center max-w-md">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold mb-2">غير مصرح بالوصول</h3>
          <p className="text-muted-foreground mb-4">
            عذراً، ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            الصلاحية المطلوبة: {permission || permissions?.join(', ')}
          </p>
          <Button 
            onClick={refreshPermissions}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث الصلاحيات
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
