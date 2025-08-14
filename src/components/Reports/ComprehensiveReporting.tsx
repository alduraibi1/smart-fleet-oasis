
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  DollarSign, 
  Car, 
  Users,
  Printer
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

interface ReportData {
  financialSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  operationalStats: {
    totalVehicles: number;
    activeContracts: number;
    utilizationRate: number;
    averageRentalDuration: number;
  };
  customerAnalytics: {
    totalCustomers: number;
    newCustomers: number;
    customerRetentionRate: number;
    averageCustomerValue: number;
  };
  monthlyTrends: any[];
  vehiclePerformance: any[];
  topCustomers: any[];
  revenueByCategory: any[];
}

export const ComprehensiveReporting = () => {
  const [reportData, setReportData] = useState<ReportData>({
    financialSummary: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0
    },
    operationalStats: {
      totalVehicles: 0,
      activeContracts: 0,
      utilizationRate: 0,
      averageRentalDuration: 0
    },
    customerAnalytics: {
      totalCustomers: 0,
      newCustomers: 0,
      customerRetentionRate: 0,
      averageCustomerValue: 0
    },
    monthlyTrends: [],
    vehiclePerformance: [],
    topCustomers: [],
    revenueByCategory: []
  });

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReportData();
  }, [selectedPeriod, startDate, endDate]);

  const generateReportData = () => {
    setLoading(true);
    
    // Generate mock data for comprehensive reporting
    setTimeout(() => {
      const mockData: ReportData = {
        financialSummary: {
          totalRevenue: 245000,
          totalExpenses: 165000,
          netProfit: 80000,
          profitMargin: 32.7
        },
        operationalStats: {
          totalVehicles: 25,
          activeContracts: 18,
          utilizationRate: 72,
          averageRentalDuration: 6.5
        },
        customerAnalytics: {
          totalCustomers: 150,
          newCustomers: 12,
          customerRetentionRate: 85,
          averageCustomerValue: 1633
        },
        monthlyTrends: Array.from({ length: 12 }, (_, i) => ({
          month: `${i + 1}/2024`,
          revenue: Math.floor(Math.random() * 50000) + 150000,
          expenses: Math.floor(Math.random() * 30000) + 100000,
          profit: Math.floor(Math.random() * 25000) + 50000,
          contracts: Math.floor(Math.random() * 10) + 15
        })),
        vehiclePerformance: [
          { vehicle: 'تويوتا كامري 2023', revenue: 25000, utilization: 85, contracts: 12 },
          { vehicle: 'هونداي إلنترا 2022', revenue: 22000, utilization: 78, contracts: 10 },
          { vehicle: 'نيسان التيما 2023', revenue: 20000, utilization: 72, contracts: 9 },
          { vehicle: 'كيا أوبتيما 2022', revenue: 18000, utilization: 68, contracts: 8 },
          { vehicle: 'شيفروليه كروز 2023', revenue: 16000, utilization: 65, contracts: 7 }
        ],
        topCustomers: [
          { name: 'أحمد محمد السالم', totalSpent: 15000, contracts: 8, lastRental: '2024-01-15' },
          { name: 'فاطمة علي النوري', totalSpent: 12000, contracts: 6, lastRental: '2024-01-10' },
          { name: 'خالد عبدالله القحطاني', totalSpent: 10000, contracts: 5, lastRental: '2024-01-08' },
          { name: 'مريم سعد الدوسري', totalSpent: 9500, contracts: 5, lastRental: '2024-01-05' },
          { name: 'عبدالعزيز محمد العتيبي', totalSpent: 8800, contracts: 4, lastRental: '2024-01-02' }
        ],
        revenueByCategory: [
          { name: 'سيارات اقتصادية', value: 45, revenue: 110000, color: '#3b82f6' },
          { name: 'سيارات متوسطة', value: 35, revenue: 85000, color: '#10b981' },
          { name: 'سيارات فاخرة', value: 20, revenue: 50000, color: '#f59e0b' }
        ]
      };

      setReportData(mockData);
      setLoading(false);
    }, 1000);
  };

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التقرير');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportFinancialReport = () => {
    const data = [
      { 'البيان': 'إجمالي الإيرادات', 'المبلغ': reportData.financialSummary.totalRevenue },
      { 'البيان': 'إجمالي المصروفات', 'المبلغ': reportData.financialSummary.totalExpenses },
      { 'البيان': 'صافي الربح', 'المبلغ': reportData.financialSummary.netProfit },
      { 'البيان': 'هامش الربح', 'المبلغ': `${reportData.financialSummary.profitMargin}%` }
    ];
    exportToExcel(data, 'التقرير_المالي');
  };

  const printReport = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="quarter">هذا الربع</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                  <SelectItem value="custom">فترة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium">من تاريخ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-40">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, 'dd/MM/yyyy', { locale: ar })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium">إلى تاريخ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-40">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, 'dd/MM/yyyy', { locale: ar })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={generateReportData}>
                تحديث التقرير
              </Button>
              <Button variant="outline" onClick={printReport}>
                <Printer className="h-4 w-4 mr-2" />
                طباعة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.financialSummary.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صافي الربح</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.financialSummary.netProfit)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الاستخدام</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reportData.operationalStats.utilizationRate}%
                </p>
              </div>
              <Car className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reportData.customerAnalytics.totalCustomers}
                </p>
              </div>
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">التقرير المالي</TabsTrigger>
          <TabsTrigger value="operational">التقرير التشغيلي</TabsTrigger>
          <TabsTrigger value="customers">تحليل العملاء</TabsTrigger>
          <TabsTrigger value="vehicles">أداء المركبات</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>الملخص المالي</CardTitle>
                  <Button size="sm" onClick={exportFinancialReport}>
                    <Download className="h-4 w-4 mr-2" />
                    تصدير
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي الإيرادات:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(reportData.financialSummary.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي المصروفات:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(reportData.financialSummary.totalExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">صافي الربح:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(reportData.financialSummary.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>هامش الربح:</span>
                    <Badge variant="default">
                      {reportData.financialSummary.profitMargin}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع الإيرادات حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={reportData.revenueByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{reportData.operationalStats.totalVehicles}</div>
                  <div className="text-sm text-muted-foreground">إجمالي المركبات</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{reportData.operationalStats.activeContracts}</div>
                  <div className="text-sm text-muted-foreground">العقود النشطة</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{reportData.operationalStats.utilizationRate}%</div>
                  <div className="text-sm text-muted-foreground">معدل الاستخدام</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{reportData.operationalStats.averageRentalDuration}</div>
                  <div className="text-sm text-muted-foreground">متوسط مدة الإيجار (أيام)</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أفضل العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead>إجمالي الإنفاق</TableHead>
                      <TableHead>العقود</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.topCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell>{customer.contracts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.customerAnalytics.newCustomers}</div>
                    <div className="text-sm text-muted-foreground">عملاء جدد هذا الشهر</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportData.customerAnalytics.customerRetentionRate}%</div>
                    <div className="text-sm text-muted-foreground">معدل الاحتفاظ بالعملاء</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(reportData.customerAnalytics.averageCustomerValue)}</div>
                    <div className="text-sm text-muted-foreground">متوسط قيمة العميل</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>أداء المركبات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المركبة</TableHead>
                    <TableHead>الإيرادات</TableHead>
                    <TableHead>معدل الاستخدام</TableHead>
                    <TableHead>عدد العقود</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.vehiclePerformance.map((vehicle, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{vehicle.vehicle}</TableCell>
                      <TableCell>{formatCurrency(vehicle.revenue)}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.utilization > 80 ? "default" : "secondary"}>
                          {vehicle.utilization}%
                        </Badge>
                      </TableCell>
                      <TableCell>{vehicle.contracts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>الاتجاهات الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="الإيرادات" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="المصروفات" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="الربح" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
