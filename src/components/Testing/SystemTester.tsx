import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  timestamp: Date;
}

const routes = [
  { path: '/', name: 'الرئيسية' },
  { path: '/vehicles', name: 'المركبات' },
  { path: '/customers', name: 'العملاء' },
  { path: '/contracts', name: 'العقود' },
  { path: '/maintenance', name: 'الصيانة' },
  { path: '/owners', name: 'المالكين' },
  { path: '/accounting', name: 'المحاسبة' },
  { path: '/reports', name: 'التقارير' },
  { path: '/hr', name: 'الموارد البشرية' },
  { path: '/suppliers', name: 'الموردين' },
  { path: '/inventory', name: 'المخزون' },
  { path: '/system', name: 'إدارة النظام' }
];

export function SystemTester() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [...prev, { ...result, timestamp: new Date() }]);
  };

  const runNavigationTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const route of routes) {
      try {
        // Test navigation
        navigate(route.path);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for navigation

        // Check if route loads without errors
        const hasErrors = document.querySelectorAll('[data-error]').length > 0;
        
        addTestResult({
          id: `nav-${route.path}`,
          name: `تنقل إلى ${route.name}`,
          status: hasErrors ? 'fail' : 'pass',
          message: hasErrors ? 'وجدت أخطاء في الصفحة' : 'تم التحميل بنجاح'
        });

        // Test responsive design
        const isMobile = window.innerWidth < 768;
        const hasResponsiveElements = document.querySelectorAll('.responsive-grid, .adaptive-grid, .dashboard-card').length > 0;
        
        addTestResult({
          id: `responsive-${route.path}`,
          name: `تجاوب ${route.name}`,
          status: hasResponsiveElements ? 'pass' : 'warning',
          message: hasResponsiveElements ? 'التصميم المتجاوب يعمل' : 'قد تحتاج عناصر متجاوبة أكثر'
        });

      } catch (error) {
        addTestResult({
          id: `error-${route.path}`,
          name: `خطأ في ${route.name}`,
          status: 'fail',
          message: error instanceof Error ? error.message : 'خطأ غير معروف'
        });
      }
    }

    setIsRunning(false);
  };

  const runPerformanceTests = () => {
    // Test console errors
    const originalError = console.error;
    const errors: string[] = [];
    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError(...args);
    };

    setTimeout(() => {
      console.error = originalError;
      addTestResult({
        id: 'console-errors',
        name: 'أخطاء وحدة التحكم',
        status: errors.length === 0 ? 'pass' : 'fail',
        message: errors.length === 0 ? 'لا توجد أخطاء' : `وجد ${errors.length} خطأ`
      });
    }, 2000);

    // Test performance
    if ('performance' in window) {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      addTestResult({
        id: 'load-time',
        name: 'زمن التحميل',
        status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
        message: `${loadTime}ms`
      });
    }
  };

  const runAccessibilityTests = () => {
    // Test basic accessibility
    const hasAltTexts = document.querySelectorAll('img[alt]').length === document.querySelectorAll('img').length;
    addTestResult({
      id: 'alt-texts',
      name: 'نصوص بديلة للصور',
      status: hasAltTexts ? 'pass' : 'warning',
      message: hasAltTexts ? 'جميع الصور لها نصوص بديلة' : 'بعض الصور تحتاج نصوص بديلة'
    });

    // Test aria labels
    const hasAriaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0;
    addTestResult({
      id: 'aria-labels',
      name: 'تسميات إمكانية الوصول',
      status: hasAriaLabels ? 'pass' : 'warning',
      message: hasAriaLabels ? 'توجد تسميات إمكانية وصول' : 'قد تحتاج المزيد من تسميات إمكانية الوصول'
    });
  };

  const runAllTests = async () => {
    await runNavigationTests();
    runPerformanceTests();
    runAccessibilityTests();
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const totalTests = testResults.length;

  return (
    <div className="content-spacing">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">اختبار النظام الشامل</h1>
          <p className="text-muted-foreground">
            اختبار شامل لجودة وأداء النظام
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">الاختبارات المنجزة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {passedTests}/{totalTests}
              </div>
              <p className="text-sm text-muted-foreground">
                {totalTests > 0 ? `${Math.round((passedTests / totalTests) * 100)}%` : '0%'} نجح
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">الحالة العامة</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                className={
                  passedTests === totalTests && totalTests > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {passedTests === totalTests && totalTests > 0 ? 'ممتاز' : 'يحتاج تحسين'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">إجراءات الاختبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning} 
                className="w-full"
                size="sm"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري الاختبار...
                  </>
                ) : (
                  'بدء الاختبار الشامل'
                )}
              </Button>
              <Button 
                onClick={() => setTestResults([])} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                مسح النتائج
              </Button>
            </CardContent>
          </Card>
        </div>

        {testResults.length > 0 && (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>نتائج الاختبارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm">{result.message}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString('ar')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}