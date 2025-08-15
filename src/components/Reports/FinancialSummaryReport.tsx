
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertTriangle } from "lucide-react";
import { useFinancialSummary, ReportFilters } from "@/hooks/useReportsData";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialSummaryReportProps {
  filters: ReportFilters;
}

export function FinancialSummaryReport({ filters }: FinancialSummaryReportProps) {
  const { data: summary, isLoading, error } = useFinancialSummary(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p>حدث خطأ في تحميل التقرير المالي</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">التقرير المالي الشامل</h2>
        <Badge variant={summary.profitMargin > 0 ? "default" : "destructive"}>
          {summary.profitMargin > 0 ? "مربح" : "خسارة"}
        </Badge>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">من سندات القبض المؤكدة</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              إجمالي المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-xs text-muted-foreground">من سندات الصرف المعتمدة</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${summary.netProfit >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {summary.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-blue-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              صافي الربح/الخسارة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(summary.netProfit)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-muted-foreground">
                هامش ربح: {formatPercentage(summary.profitMargin)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              إحصائيات العقود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">العقود النشطة</span>
                <Badge className="bg-green-100 text-green-800">
                  {summary.activeContracts}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">العقود المكتملة</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {summary.completedContracts}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">إجمالي العقود</span>
                <Badge variant="outline">
                  {summary.activeContracts + summary.completedContracts}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التحليل المالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>نسبة هامش الربح</span>
                  <span className={summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(summary.profitMargin)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${summary.profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(summary.profitMargin), 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>متوسط إيرادات العقد</span>
                    <span className="font-medium">
                      {summary.activeContracts + summary.completedContracts > 0
                        ? formatCurrency(summary.totalRevenue / (summary.activeContracts + summary.completedContracts))
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>نسبة المصروفات من الإيرادات</span>
                    <span className="font-medium">
                      {summary.totalRevenue > 0 
                        ? formatPercentage((summary.totalExpenses / summary.totalRevenue) * 100)
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Alerts */}
      {summary.profitMargin < 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تنبيه مالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              تظهر البيانات خسارة مالية في الفترة المحددة. يُنصح بمراجعة المصروفات وتحسين الإيرادات.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
