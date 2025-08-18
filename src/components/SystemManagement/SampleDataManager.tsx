
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, Trash2, Plus } from "lucide-react";
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

export const SampleDataManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInsertSampleData = async () => {
    setLoading(true);
    try {
      const result = await insertSampleData();
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: result.message,
        });
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSampleData = async () => {
    setLoading(true);
    try {
      const result = await clearSampleData();
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: result.message,
        });
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          إدارة البيانات التجريبية
        </CardTitle>
        <CardDescription>
          إضافة أو حذف البيانات التجريبية لاختبار النظام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">إضافة البيانات التجريبية</h4>
            <p className="text-sm text-muted-foreground">
              إضافة مجموعة كاملة من البيانات التجريبية تشمل:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>3 عملاء مع بيانات كاملة</li>
              <li>2 ملاك مركبات</li>
              <li>5 مركبات بحالات مختلفة</li>
              <li>2 ميكانيكي</li>
              <li>2 مورد</li>
              <li>3 مواد مخزون</li>
              <li>2 عقد إيجار</li>
            </ul>
            <Button 
              onClick={handleInsertSampleData} 
              disabled={loading}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              إضافة البيانات التجريبية
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-destructive">حذف البيانات التجريبية</h4>
            <p className="text-sm text-muted-foreground">
              حذف جميع البيانات التجريبية من النظام
            </p>
            <div className="bg-destructive/10 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                تحذير: هذا الإجراء سيحذف جميع البيانات ولا يمكن التراجع عنه
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={loading}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف البيانات التجريبية
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف جميع البيانات التجريبية من النظام. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearSampleData}>
                    نعم، احذف البيانات
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h5 className="font-medium mb-2">معلومات مهمة:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• البيانات التجريبية مصممة لاختبار جميع وظائف النظام</li>
            <li>• يمكن استخدام هذه البيانات للتدريب والعروض التقديمية</li>
            <li>• احرص على حذف البيانات التجريبية قبل البدء بالاستخدام الفعلي</li>
            <li>• يمكن إعادة إضافة البيانات التجريبية في أي وقت</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
