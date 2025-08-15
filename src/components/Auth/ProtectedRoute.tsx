import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user && requiredRole && !hasRole(requiredRole)) {
      navigate('/'); // توجيه للصفحة الرئيسية إذا لم تكن هناك صلاحيات
      return;
    }
  }, [user, loading, requiredRole, hasRole, navigate]);

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
    return null; // سيتم التوجيه إلى صفحة تسجيل الدخول
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">غير مصرح</h2>
            <p className="text-muted-foreground">
              ليس لديك الصلاحيات المطلوبة للوصول لهذه الصفحة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}