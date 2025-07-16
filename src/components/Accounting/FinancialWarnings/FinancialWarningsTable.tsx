import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Eye, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FinancialWarning {
  id: string;
  warning_type: string;
  warning_message: string;
  amount: number;
  available_balance: number;
  deficit: number;
  acknowledged: boolean;
  created_at: string;
  owner_id: string;
  voucher_id: string;
}

export function FinancialWarningsTable() {
  const [warnings, setWarnings] = useState<FinancialWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_warnings')
        .select(`
          *,
          vehicle_owners!financial_warnings_owner_id_fkey(name),
          payment_vouchers!financial_warnings_voucher_id_fkey(voucher_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWarnings(data || []);
    } catch (error) {
      console.error('Error fetching warnings:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب التحذيرات المالية",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeWarning = async (warningId: string) => {
    try {
      const { error } = await supabase
        .from('financial_warnings')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', warningId);

      if (error) throw error;

      setWarnings(prev => 
        prev.map(warning => 
          warning.id === warningId 
            ? { ...warning, acknowledged: true }
            : warning
        )
      );

      toast({
        title: "تم الإقرار",
        description: "تم الإقرار بالتحذير المالي",
        variant: "default"
      });
    } catch (error) {
      console.error('Error acknowledging warning:', error);
      toast({
        title: "خطأ",
        description: "فشل في الإقرار بالتحذير",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getWarningTypeLabel = (type: string) => {
    switch (type) {
      case 'insufficient_balance':
        return 'رصيد غير كافي';
      case 'overspending':
        return 'إفراط في الإنفاق';
      case 'negative_balance':
        return 'رصيد سالب';
      default:
        return type;
    }
  };

  const getWarningIcon = (acknowledged: boolean) => {
    return acknowledged ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>التحذيرات المالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          التحذيرات المالية
        </CardTitle>
        <CardDescription>
          عرض التحذيرات المالية المتعلقة بمحاولات الصرف بدون رصيد كافي
        </CardDescription>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد تحذيرات مالية
          </div>
        ) : (
          <div className="space-y-4">
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800">تحذيرات غير مقرة</div>
                <div className="text-2xl font-bold text-red-600">
                  {warnings.filter(w => !w.acknowledged).length}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm font-medium text-green-800">تحذيرات مقرة</div>
                <div className="text-2xl font-bold text-green-600">
                  {warnings.filter(w => w.acknowledged).length}
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-sm font-medium text-orange-800">إجمالي العجز</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(warnings.reduce((sum, w) => sum + w.deficit, 0))}
                </div>
              </div>
            </div>

            {/* جدول التحذيرات */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">نوع التحذير</TableHead>
                    <TableHead className="text-right">المبلغ المطلوب</TableHead>
                    <TableHead className="text-right">الرصيد المتاح</TableHead>
                    <TableHead className="text-right">العجز</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warnings.map((warning) => (
                    <TableRow key={warning.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getWarningIcon(warning.acknowledged)}
                          <Badge variant={warning.acknowledged ? "default" : "destructive"}>
                            {warning.acknowledged ? "مقر" : "غير مقر"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {getWarningTypeLabel(warning.warning_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-red-600">
                          {formatCurrency(warning.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {formatCurrency(warning.available_balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-orange-600">
                          {formatCurrency(warning.deficit)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(warning.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            عرض
                          </Button>
                          {!warning.acknowledged && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => acknowledgeWarning(warning.id)}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              إقرار
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}