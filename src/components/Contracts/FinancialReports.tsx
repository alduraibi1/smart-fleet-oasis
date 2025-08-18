
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Users
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface FinancialReportsProps {
  contracts: any[];
}

export const FinancialReports = ({ contracts }: FinancialReportsProps) => {
  const [reportType, setReportType] = useState('revenue');
  const [timePeriod, setTimePeriod] = useState('month');
  const { toast } = useToast();

  // حساب البيانات المالية
  const totalRevenue = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0);
  const totalPaid = contracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
  const totalPending = totalRevenue - totalPaid;
  const avgDailyRate = contracts.reduce((sum, c) => sum + (c.daily_rate || 0), 0) / (contracts.length || 1);

  // تقرير الإيرادات الشهرية (محاكاة)
  const monthlyRevenue = [
    { month: 'يناير', revenue: 245000, contracts: 15 },
    { month: 'فبراير', revenue: 287000, contracts: 18 },
    { month: 'مارس', revenue: 312000, contracts: 22 },
    { month: 'أبريل', revenue: 298000, contracts: 19 },
    { month: 'مايو', revenue: 334000, contracts: 24 },
    { month: 'يونيو', revenue: 356000, contracts: 26 }
  ];

  // تقرير العملاء الأكثر ربحية (محاكاة)
  const topCustomers = [
    { name: 'شركة الخليج للتجارة', revenue: 125000, contracts: 8 },
    { name: 'أحمد محمد العلي', revenue: 89000, contracts: 12 },
    { name: 'مؤسسة الرياض التجارية', revenue: 76000, contracts: 6 },
    { name: 'فاطمة سعد الغامدي', revenue: 54000, contracts: 9 },
    { name: 'محمد عبدالله النجار', revenue: 43000, contracts: 7 }
  ];

  // تقرير أنواع المركبات (محاكاة)
  const vehicleTypes = [
    { type: 'سيدان', revenue: 180000, count: 45, percentage: 35 },
    { type: 'SUV', revenue: 220000, count: 38, percentage: 30 },
    { type: 'تجاري', revenue: 150000, count: 25, percentage: 20 },
    { type: 'فان', revenue: 98000, count: 18, percentage: 15 }
  ];

  const exportReport = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFileName = `financial-report-${timestamp}`;

    if (format === "excel") {
      // Summary sheet
      const summaryRows = [
        ["إجمالي الإيرادات", totalRevenue],
        ["المدفوع", totalPaid],
        ["المعلق", totalPending],
        ["متوسط اليومي (للعقد الواحد)", Math.round(avgDailyRate)],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet([["البند", "القيمة"], ...summaryRows]);

      // Monthly revenue sheet
      const wsMonthly = XLSX.utils.json_to_sheet(
        monthlyRevenue.map((m) => ({
          الشهر: m.month,
          الإيرادات: m.revenue,
          العقود: m.contracts,
        }))
      );

      // Top customers sheet
      const wsCustomers = XLSX.utils.json_to_sheet(
        topCustomers.map((c, idx) => ({
          الترتيب: idx + 1,
          العميل: c.name,
          الإيرادات: c.revenue,
          العقود: c.contracts,
          "متوسط/عقد": Math.round(c.revenue / c.contracts),
        }))
      );

      // Vehicle types sheet
      const wsVehicles = XLSX.utils.json_to_sheet(
        vehicleTypes.map((v) => ({
          النوع: v.type,
          الإيرادات: v.revenue,
          العدد: v.count,
          النسبة: `${v.percentage}%`,
          "متوسط/مركبة": Math.round(v.revenue / v.count),
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSummary, "ملخص");
      XLSX.utils.book_append_sheet(wb, wsMonthly, "إيرادات شهرية");
      XLSX.utils.book_append_sheet(wb, wsCustomers, "أفضل العملاء");
      XLSX.utils.book_append_sheet(wb, wsVehicles, "أنواع المركبات");

      XLSX.writeFile(wb, `${baseFileName}.xlsx`);
      toast({ title: "تم التصدير", description: "تم إنشاء ملف Excel بنجاح" });
      return;
    }

    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "p", unit: "pt" });

      // Title
      doc.setFontSize(16);
      doc.text("تقرير مالي", 40, 40);

      // Summary
      doc.setFontSize(12);
      autoTable(doc, {
        startY: 60,
        head: [["البند", "القيمة"]],
        body: [
          ["إجمالي الإيرادات", totalRevenue.toLocaleString()],
          ["المدفوع", totalPaid.toLocaleString()],
          ["المعلق", totalPending.toLocaleString()],
          ["متوسط اليومي (للعقد الواحد)", Math.round(avgDailyRate).toLocaleString()],
        ],
        styles: { halign: "right" },
        headStyles: { halign: "right" },
      });

      // Monthly revenue
      autoTable(doc, {
        head: [["الشهر", "الإيرادات", "العقود"]],
        body: monthlyRevenue.map((m) => [
          m.month,
          m.revenue.toLocaleString(),
          m.contracts,
        ]),
        styles: { halign: "right" },
        headStyles: { halign: "right" },
        startY: (doc as any).lastAutoTable.finalY + 20,
      });

      // Top customers
      autoTable(doc, {
        head: [["الترتيب", "العميل", "الإيرادات", "العقود", "متوسط/عقد"]],
        body: topCustomers.map((c, idx) => [
          idx + 1,
          c.name,
          c.revenue.toLocaleString(),
          c.contracts,
          Math.round(c.revenue / c.contracts).toLocaleString(),
        ]),
        styles: { halign: "right" },
        headStyles: { halign: "right" },
        startY: (doc as any).lastAutoTable.finalY + 20,
      });

      // Vehicle types
      autoTable(doc, {
        head: [["النوع", "الإيرادات", "العدد", "النسبة", "متوسط/مركبة"]],
        body: vehicleTypes.map((v) => [
          v.type,
          v.revenue.toLocaleString(),
          v.count,
          `${v.percentage}%`,
          Math.round(v.revenue / v.count).toLocaleString(),
        ]),
        styles: { halign: "right" },
        headStyles: { halign: "right" },
        startY: (doc as any).lastAutoTable.finalY + 20,
      });

      doc.save(`${baseFileName}.pdf`);
      toast({ title: "تم الإنشاء", description: "تم إنشاء ملف PDF بنجاح" });
      return;
    }

    // تنبيه في حال صيغة غير مدعومة
    toast({ title: "صيغة غير مدعومة", description: "يرجى اختيار PDF أو Excel", variant: "destructive" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">تقرير الإيرادات</SelectItem>
              <SelectItem value="customers">تقرير العملاء</SelectItem>
              <SelectItem value="vehicles">تقرير المركبات</SelectItem>
              <SelectItem value="payments">تقرير المدفوعات</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوعي</SelectItem>
              <SelectItem value="month">شهري</SelectItem>
              <SelectItem value="quarter">ربعي</SelectItem>
              <SelectItem value="year">سنوي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString()} ريال
            </div>
            <div className="text-xs text-muted-foreground">+12.5% من الشهر الماضي</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              المدفوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalPaid.toLocaleString()} ريال
            </div>
            <div className="text-xs text-muted-foreground">
              {totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0}% معدل التحصيل
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              المعلق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalPending.toLocaleString()} ريال
            </div>
            <div className="text-xs text-muted-foreground">يحتاج متابعة</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              متوسط اليومي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(avgDailyRate).toLocaleString()} ريال
            </div>
            <div className="text-xs text-muted-foreground">للعقد الواحد</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            الإيرادات الشهرية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenue.map((month, index) => {
              const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
              const percentage = (month.revenue / maxRevenue) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{month.month}</span>
                    <div className="text-right">
                      <div className="font-bold">{month.revenue.toLocaleString()} ريال</div>
                      <div className="text-xs text-muted-foreground">{month.contracts} عقد</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            العملاء الأكثر ربحية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.contracts} عقد</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{customer.revenue.toLocaleString()} ريال</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(customer.revenue / customer.contracts).toLocaleString()} متوسط/عقد
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Types Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            أداء أنواع المركبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {vehicleTypes.map((vehicle, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{vehicle.type}</span>
                    <span className="text-muted-foreground">{vehicle.count} مركبة</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${vehicle.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{vehicle.percentage}%</span>
                    <span>{vehicle.revenue.toLocaleString()} ريال</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">تحليل الأداء</h4>
              {vehicleTypes.map((vehicle, index) => {
                const avgPerVehicle = vehicle.revenue / vehicle.count;
                return (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">{vehicle.type}</span>
                    <Badge variant="outline">
                      {Math.round(avgPerVehicle).toLocaleString()} ريال/مركبة
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
