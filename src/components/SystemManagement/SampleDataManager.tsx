
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, Trash2, Plus, CheckCircle, Users, Car, FileText, Wrench, Package, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertSampleData, clearSampleData } from "@/utils/sampleData";
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
import { Progress } from "@/components/ui/progress";

export const SampleDataManager = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState('');
  const { toast } = useToast();

  const handleInsertSampleData = async () => {
    setLoading(true);
    setProgress(0);
    setOperationStatus('جاري إعداد البيانات التجريبية...');
    
    try {
      // محاكاة التقدم للحصول على تجربة مستخدم أفضل
      const progressSteps = [
        { step: 10, message: 'إضافة العملاء...' },
        { step: 25, message: 'إضافة ملاك المركبات...' },
        { step: 40, message: 'إضافة المركبات...' },
        { step: 60, message: 'إضافة الميكانيكيين...' },
        { step: 75, message: 'إضافة الموردين...' },
        { step: 90, message: 'إضافة مواد المخزون...' },
        { step: 100, message: 'إنشاء العقود التجريبية...' }
      ];

      for (const { step, message } of progressSteps) {
        setProgress(step);
        setOperationStatus(message);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const result = await insertSampleData();
      
      if (result.success) {
        toast({
          title: "تم بنجاح! ✅",
          description: "تم إضافة جميع البيانات التجريبية بنجاح. يمكنك الآن استكشاف النظام بالكامل.",
          duration: 5000,
        });
        setOperationStatus('تم إكمال العملية بنجاح!');
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        });
        setOperationStatus('حدث خطأ في العملية');
      }
    } catch (error) {
      console.error('خطأ في إضافة البيانات:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء إضافة البيانات",
        variant: "destructive",
      });
      setOperationStatus('فشلت العملية');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setOperationStatus('');
      }, 2000);
    }
  };

  const handleClearSampleData = async () => {
    setLoading(true);
    setProgress(0);
    setOperationStatus('جاري حذف البيانات التجريبية...');
    
    try {
      setProgress(50);
      const result = await clearSampleData();
      setProgress(100);
      
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: "تم حذف جميع البيانات التجريبية بنجاح",
        });
        setOperationStatus('تم الحذف بنجاح');
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        });
        setOperationStatus('فشل في الحذف');
      }
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء حذف البيانات",
        variant: "destructive",
      });
      setOperationStatus('فشلت العملية');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setOperationStatus('');
      }, 1500);
    }
  };

  const sampleDataItems = [
    { icon: Users, label: "3 عملاء", description: "بيانات كاملة مع الضامنين والمستندات" },
    { icon: Building2, label: "2 ملاك مركبات", description: "شركات تأجير مع شروط العمولة" },
    { icon: Car, label: "5 مركبات", description: "مركبات بحالات مختلفة (متاحة، مؤجرة، صيانة)" },
    { icon: Wrench, label: "2 ميكانيكي", description: "فنيون متخصصون مع معدلات الأجور" },
    { icon: Building2, label: "2 مورد", description: "موردي قطع الغيار والمواد" },
    { icon: Package, label: "3 مواد مخزون", description: "زيوت وفلاتر وإطارات" },
    { icon: FileText, label: "2 عقد إيجار", description: "عقود تجريبية (نشط ومكتمل)" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          إدارة البيانات التجريبية
        </CardTitle>
        <CardDescription>
          إضافة أو حذف البيانات التجريبية لاختبار النظام واستكشاف جميع الميزات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* شريط التقدم أثناء العمليات */}
        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{operationStatus}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* قسم إضافة البيانات */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-600">إضافة البيانات التجريبية</h4>
            </div>
            
            <p className="text-sm text-muted-foreground">
              إضافة مجموعة كاملة من البيانات التجريبية لاختبار جميع وظائف النظام:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {sampleDataItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <item.icon className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleInsertSampleData} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              إدراج البيانات التجريبية
            </Button>
          </div>

          {/* قسم حذف البيانات */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-600">حذف البيانات التجريبية</h4>
            </div>
            
            <p className="text-sm text-muted-foreground">
              حذف جميع البيانات التجريبية من النظام لتنظيف قاعدة البيانات
            </p>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-medium text-red-800">تحذير مهم</div>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• سيتم حذف جميع البيانات التجريبية نهائياً</li>
                    <li>• لا يمكن التراجع عن هذا الإجراء</li>
                    <li>• تأكد من عدم الحاجة لهذه البيانات</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف البيانات التجريبية
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    تأكيد حذف البيانات
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-right">
                    هذا الإجراء سيحذف جميع البيانات التجريبية من النظام بما في ذلك:
                    <br />
                    • العملاء والضامنين والمستندات
                    <br />
                    • المركبات وملاكها
                    <br />
                    • العقود وسجلات الصيانة
                    <br />
                    • الميكانيكيين والموردين
                    <br />
                    • مواد المخزون وحركاته
                    <br />
                    <br />
                    <strong className="text-red-600">لا يمكن التراجع عن هذا الإجراء!</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex gap-2">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearSampleData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    نعم، احذف جميع البيانات
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800 mb-2">نصائح للاستخدام الأمثل:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• استخدم البيانات التجريبية لاختبار جميع وظائف النظام</li>
                <li>• قم بإنشاء عقود جديدة وتجربة عملية الإرجاع</li>
                <li>• اختبر تقارير الربحية والتحليلات المالية</li>
                <li>• تأكد من تجربة إدارة الصيانة والمخزون</li>
                <li>• احذف البيانات التجريبية قبل البدء بالاستخدام الفعلي</li>
                <li>• يمكن إعادة إدراج البيانات التجريبية في أي وقت</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
