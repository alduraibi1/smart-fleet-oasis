import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Shield, User, Settings, DollarSign } from 'lucide-react';

export function UserRoles() {
  const { userRoles } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
        return <Settings className="h-4 w-4" />;
      case 'accountant':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'manager':
        return 'مدير';
      case 'accountant':
        return 'محاسب';
      case 'employee':
        return 'موظف';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'صلاحيات كاملة لإدارة النظام وجميع البيانات';
      case 'manager':
        return 'إدارة العمليات والموظفين والتقارير';
      case 'accountant':
        return 'إدارة الحسابات والمعاملات المالية';
      case 'employee':
        return 'الوصول الأساسي للنظام والعمليات اليومية';
      default:
        return 'دور مخصص في النظام';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">الأدوار المخصصة لك</h3>
        <div className="grid gap-4">
          {userRoles.length > 0 ? (
            userRoles.map((role) => (
              <Card key={role} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getRoleIcon(role)}
                    {getRoleName(role)}
                  </CardTitle>
                  <CardDescription>
                    {getRoleDescription(role)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="mt-2">
                    نشط
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  لم يتم تخصيص أي أدوار لحسابك بعد
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  تواصل مع الإدارة لتحديد الصلاحيات المناسبة
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">معلومات إضافية</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">تاريخ إنشاء الحساب:</span>
                <p className="text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div>
                <span className="font-medium">آخر تسجيل دخول:</span>
                <p className="text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}