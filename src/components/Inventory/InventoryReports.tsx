
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  BarChart3,
  PieChart
} from "lucide-react";

const InventoryReports = () => {
  const [selectedReport, setSelectedReport] = useState("stock-levels");
  const [timeRange, setTimeRange] = useState("month");

  // Mock reports data
  const reports = [
    {
      id: "stock-levels",
      name: "تقرير مستويات المخزون",
      description: "عرض تفصيلي لمستويات المخزون الحالية",
      icon: Package,
      color: "text-blue-600"
    },
    {
      id: "movement",
      name: "تقرير حركة المخزون",
      description: "تتبع حركة المخزون الداخلة والخارجة",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      id: "low-stock",
      name: "تقرير المخزون المنخفض",
      description: "العناصر التي تحتاج إلى إعادة تجديد",
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      id: "valuation",
      name: "تقرير تقييم المخزون",
      description: "القيمة المالية للمخزون الحالي",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      id: "categories",
      name: "تقرير الفئات",
      description: "توزيع المخزون حسب الفئات",
      icon: PieChart,
      color: "text-teal-600"
    }
  ];

  // Mock report data
  const reportData = {
    "stock-levels": [
      { item: "فلتر زيت محرك", current: 45, min: 20, max: 100, status: "جيد" },
      { item: "زيت محرك 5W-30", current: 8, min: 15, max: 50, status: "منخفض" },
      { item: "فرامل أقراص", current: 25, min: 10, max: 60, status: "جيد" }
    ],
    "movement": [
      { date: "2024-01-15", item: "فلتر زيت محرك", type: "دخول", quantity: 50, reason: "شراء" },
      { date: "2024-01-14", item: "زيت محرك 5W-30", type: "خروج", quantity: 12, reason: "استخدام" },
      { date: "2024-01-13", item: "فرامل أقراص", type: "دخول", quantity: 30, reason: "شراء" }
    ],
    "low-stock": [
      { item: "زيت محرك 5W-30", current: 8, min: 15, shortage: 7 },
      { item: "فلتر هواء", current: 5, min: 12, shortage: 7 }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "جيد":
        return <Badge className="bg-green-100 text-green-800">جيد</Badge>;
      case "منخفض":
        return <Badge variant="destructive">منخفض</Badge>;
      case "عالي":
        return <Badge className="bg-blue-100 text-blue-800">عالي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedReportData = reports.find(r => r.id === selectedReport);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          تقارير المخزون
        </h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير PDF
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">أنواع التقارير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-right p-3 rounded-lg border transition-colors ${
                    selectedReport === report.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <report.icon className={`h-5 w-5 ${report.color} mt-0.5`} />
                    <div>
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  {selectedReportData && (
                    <>
                      <selectedReportData.icon className={`h-5 w-5 ${selectedReportData.color}`} />
                      {selectedReportData.name}
                    </>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">الأسبوع</SelectItem>
                      <SelectItem value="month">الشهر</SelectItem>
                      <SelectItem value="quarter">الربع</SelectItem>
                      <SelectItem value="year">السنة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedReport === "stock-levels" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-2">العنصر</th>
                          <th className="text-right p-2">المخزون الحالي</th>
                          <th className="text-right p-2">الحد الأدنى</th>
                          <th className="text-right p-2">الحد الأقصى</th>
                          <th className="text-right p-2">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData["stock-levels"].map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{item.item}</td>
                            <td className="p-2">{item.current}</td>
                            <td className="p-2">{item.min}</td>
                            <td className="p-2">{item.max}</td>
                            <td className="p-2">{getStatusBadge(item.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedReport === "movement" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-2">التاريخ</th>
                          <th className="text-right p-2">العنصر</th>
                          <th className="text-right p-2">النوع</th>
                          <th className="text-right p-2">الكمية</th>
                          <th className="text-right p-2">السبب</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.movement.map((transaction, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{transaction.date}</td>
                            <td className="p-2 font-medium">{transaction.item}</td>
                            <td className="p-2">
                              <Badge variant={transaction.type === "دخول" ? "default" : "outline"}>
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="p-2">{transaction.quantity}</td>
                            <td className="p-2">{transaction.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedReport === "low-stock" && (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {reportData["low-stock"].map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.item}</h4>
                            <p className="text-sm text-muted-foreground">
                              المخزون الحالي: {item.current} | الحد الأدنى: {item.min}
                            </p>
                          </div>
                          <div className="text-center">
                            <Badge variant="destructive">
                              نقص {item.shortage} قطعة
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedReport === "valuation" || selectedReport === "categories") && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <selectedReportData.icon className="h-12 w-12 mx-auto mb-4" />
                    <p>سيتم إضافة هذا التقرير قريباً</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
