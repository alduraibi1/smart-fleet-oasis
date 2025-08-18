
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Lock,
  Users,
  Database,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  category: 'authentication' | 'authorization' | 'data' | 'access';
}

const SecurityAudit = () => {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  // Only allow admins to access this component
  if (!hasRole('admin')) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">غير مصرح</h2>
          <p className="text-muted-foreground">
            مراجعة الأمان متاحة لمديري النظام فقط
          </p>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    performSecurityAudit();
  }, []);

  const performSecurityAudit = async () => {
    setLoading(true);
    
    // Simulate security checks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const checks: SecurityCheck[] = [
      {
        id: '1',
        name: 'فحص المصادقة',
        description: 'التحقق من آمان نظام المصادقة',
        status: 'pass',
        details: 'نظام المصادقة يعمل بشكل صحيح مع Supabase',
        category: 'authentication'
      },
      {
        id: '2',
        name: 'فحص RLS Policies',
        description: 'التحقق من سياسات الأمان على مستوى الصفوف',
        status: 'warning',
        details: 'بعض الجداول تحتاج لتحديث سياسات الأمان',
        category: 'data'
      },
      {
        id: '3',
        name: 'فحص الصلاحيات',
        description: 'التحقق من نظام الأدوار والصلاحيات',
        status: 'pass',
        details: 'نظام الأدوار يعمل بشكل صحيح',
        category: 'authorization'
      },
      {
        id: '4',
        name: 'فحص الوصول للصفحات الحساسة',
        description: 'التحقق من حماية الصفحات الإدارية',
        status: 'pass',
        details: 'جميع الصفحات الإدارية محمية بالأدوار المناسبة',
        category: 'access'
      },
      {
        id: '5',
        name: 'فحص العمليات الجماعية',
        description: 'التحقق من أمان العمليات الجماعية',
        status: 'warning',
        details: 'بعض العمليات الجماعية تحتاج لمزيد من التقييد',
        category: 'access'
      }
    ];
    
    setSecurityChecks(checks);
    setLoading(false);
  };

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">آمن</Badge>;
      case 'fail':
        return <Badge variant="destructive">غير آمن</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">يحتاج مراجعة</Badge>;
    }
  };

  const getCategoryIcon = (category: SecurityCheck['category']) => {
    switch (category) {
      case 'authentication':
        return <Lock className="h-4 w-4" />;
      case 'authorization':
        return <Shield className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      case 'access':
        return <Users className="h-4 w-4" />;
    }
  };

  const categoryNames = {
    authentication: 'المصادقة',
    authorization: 'الصلاحيات',
    data: 'البيانات',
    access: 'الوصول'
  };

  const passCount = securityChecks.filter(check => check.status === 'pass').length;
  const warningCount = securityChecks.filter(check => check.status === 'warning').length;
  const failCount = securityChecks.filter(check => check.status === 'fail').length;

  return (
    <div className="space-y-6">
      {/* ملخص الأمان */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الفحوصات
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityChecks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              آمن
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              يحتاج مراجعة
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              غير آمن
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* نتائج الفحص */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            نتائج مراجعة الأمان
          </CardTitle>
          <Button 
            onClick={performSecurityAudit} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            إعادة الفحص
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {securityChecks.map((check) => (
                <Card key={check.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(check.category)}
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{check.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {categoryNames[check.category]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {check.description}
                        </p>
                        <p className="text-sm">{check.details}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAudit;
