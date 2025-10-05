
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type UserRole = 'admin' | 'accountant' | 'employee' | 'manager';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  bypassAuth?: boolean; // وضع التطوير - تخطي المصادقة
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission,
  bypassAuth = true // تفعيل وضع التطوير افتراضياً
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasPermissionSync } = useAuth();
  const navigate = useNavigate();

  // تخطي المصادقة في وضع التطوير
  if (bypassAuth) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && requiredRole && !hasRole(requiredRole)) {
      navigate('/');
      return;
    }

    if (user && requiredPermission && !hasPermissionSync(requiredPermission)) {
      navigate('/');
      return;
    }
  }, [user, loading, requiredRole, requiredPermission, hasRole, hasPermissionSync, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري التحقق من صلاحياتك...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">غير مصرح</h2>
            <p className="text-muted-foreground">
              ليس لديك الدور المطلوب للوصول لهذه الصفحة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredPermission && !hasPermissionSync(requiredPermission)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">غير مصرح</h2>
            <p className="text-muted-foreground">
              ليس لديك الصلاحية المطلوبة للوصول لهذه الصفحة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
