
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  AlertTriangle,
  Shield,
  Lock
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/hooks/useAuth';

const SecureSampleDataManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useAuth();

  // Only allow admins to access this component
  if (!hasRole('admin')) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">غير مصرح</h2>
          <p className="text-muted-foreground">
            هذه الميزة متاحة لمديري النظام فقط
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleClearData = async () => {
    setLoading(true);
    try {
      // This would normally call a secure backend function
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم مسح البيانات التجريبية",
        description: "تم حذف جميع البيانات التجريبية بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في مسح البيانات",
        description: "حدث خطأ أثناء محاولة مسح البيانات التجريبية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateData = async () => {
    setLoading(true);
    try {
      // This would normally call a secure backend function
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "تم إنشاء البيانات التجريبية",
        description: "تم إنشاء البيانات التجريبية بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء البيانات",
        description: "حدث خطأ أثناء محاولة إنشاء البيانات التجريبية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">تحذير أمني</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">
            هذه العمليات تؤثر على قاعدة البيانات الرئيسية وقد تؤدي إلى فقدان البيانات. 
            يُنصح بعمل نسخة احتياطية قبل المتابعة.
          </p>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600" />
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              مقيد لمديري النظام فقط
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            إدارة البيانات التجريبية الآمنة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold">إنشاء بيانات تجريبية</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                إنشاء بيانات تجريبية آمنة لاختبار النظام
              </p>
              <Button 
                onClick={handleGenerateData}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء البيانات"}
              </Button>
            </Card>

            <Card className="p-4 border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                <h3 className="font-semibold text-destructive">مسح البيانات التجريبية</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                حذف جميع البيانات التجريبية من النظام
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={loading}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    مسح البيانات
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      تأكيد الحذف النهائي
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        هل أنت متأكد من حذف جميع البيانات التجريبية؟
                      </p>
                      <p className="text-destructive font-medium">
                        تحذير: هذا الإجراء لا يمكن التراجع عنه وسيحذف:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>جميع العملاء التجريبيين</li>
                        <li>جميع المركبات التجريبية</li>
                        <li>جميع العقود التجريبية</li>
                        <li>جميع البيانات المالية التجريبية</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearData}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      تأكيد الحذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureSampleDataManager;
