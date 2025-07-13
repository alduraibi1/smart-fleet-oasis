import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, Calculator, FileText, TrendingUp, 
  Calendar, Download, Plus, Search, Filter
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PayrollManagement = () => {
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPayrollDialogOpen, setIsAddPayrollDialogOpen] = useState(false);

  // Sample payroll data
  const payrollData = [
    {
      id: "PAY001",
      employeeId: "EMP001",
      employeeName: "أحمد محمد علي",
      basicSalary: 15000,
      allowances: 2500,
      deductions: 1200,
      netSalary: 16300,
      month: "2024-01",
      status: "مدفوع"
    },
    {
      id: "PAY002",
      employeeId: "EMP002", 
      employeeName: "فاطمة أحمد خالد",
      basicSalary: 12000,
      allowances: 1800,
      deductions: 900,
      netSalary: 12900,
      month: "2024-01",
      status: "معلق"
    },
    {
      id: "PAY003",
      employeeId: "EMP003",
      employeeName: "محمد عبدالله السالم",
      basicSalary: 10000,
      allowances: 1500,
      deductions: 750,
      netSalary: 10750,
      month: "2024-01",
      status: "مدفوع"
    }
  ];

  const monthlyTrends = [
    { month: "يناير", total: 2450000, employees: 247 },
    { month: "فبراير", total: 2380000, employees: 243 },
    { month: "مارس", total: 2520000, employees: 251 },
    { month: "أبريل", total: 2600000, employees: 258 },
    { month: "مايو", total: 2650000, employees: 265 },
    { month: "يونيو", total: 2720000, employees: 272 }
  ];

  const payrollBreakdown = [
    { name: "الراتب الأساسي", value: 1800000, color: "#8884d8" },
    { name: "البدلات", value: 450000, color: "#82ca9d" },
    { name: "المكافآت", value: 320000, color: "#ffc658" },
    { name: "العمولات", value: 150000, color: "#ff7300" }
  ];

  const filteredPayroll = payrollData.filter(payroll =>
    payroll.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      "مدفوع": "default",
      "معلق": "secondary",
      "مرفوض": "destructive"
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const totalPayroll = payrollData.reduce((sum, item) => sum + item.netSalary, 0);
  const averageSalary = totalPayroll / payrollData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة الرواتب</h2>
          <p className="text-muted-foreground">إدارة رواتب الموظفين والبدلات والخصميات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
          <Dialog open={isAddPayrollDialogOpen} onOpenChange={setIsAddPayrollDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة راتب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة راتب جديد</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">الموظف</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emp1">أحمد محمد علي</SelectItem>
                      <SelectItem value="emp2">فاطمة أحمد خالد</SelectItem>
                      <SelectItem value="emp3">محمد عبدالله السالم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month">الشهر</Label>
                  <Input id="month" type="month" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">الراتب الأساسي</Label>
                  <Input id="basicSalary" type="number" placeholder="15000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowances">البدلات</Label>
                  <Input id="allowances" type="number" placeholder="2500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions">الخصميات</Label>
                  <Input id="deductions" type="number" placeholder="1200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus">المكافآت</Label>
                  <Input id="bonus" type="number" placeholder="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddPayrollDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsAddPayrollDialogOpen(false)}>
                  حفظ الراتب
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayroll.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الراتب</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageSalary).toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground">للموظف الواحد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرواتب المدفوعة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">من أصل 3 موظفين</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النمو الشهري</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5.2%</div>
            <p className="text-xs text-muted-foreground">مقارنة بالشهر الماضي</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payroll" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payroll">كشوف الرواتب</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>كشوف الرواتب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث بالاسم أو رقم الموظف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="اختر الشهر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01">يناير 2024</SelectItem>
                    <SelectItem value="2024-02">فبراير 2024</SelectItem>
                    <SelectItem value="2024-03">مارس 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>الراتب الأساسي</TableHead>
                    <TableHead>البدلات</TableHead>
                    <TableHead>الخصميات</TableHead>
                    <TableHead>صافي الراتب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayroll.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{payroll.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{payroll.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payroll.basicSalary.toLocaleString()} ر.س</TableCell>
                      <TableCell className="text-green-600">+{payroll.allowances.toLocaleString()} ر.س</TableCell>
                      <TableCell className="text-red-600">-{payroll.deductions.toLocaleString()} ر.س</TableCell>
                      <TableCell className="font-bold">{payroll.netSalary.toLocaleString()} ر.س</TableCell>
                      <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            عرض
                          </Button>
                          <Button variant="outline" size="sm">
                            تعديل
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>اتجاهات الرواتب الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع مكونات الراتب</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={payrollBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {payrollBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير الرواتب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                  <FileText className="h-8 w-8" />
                  <span className="font-medium">تقرير الرواتب الشهري</span>
                  <span className="text-sm text-muted-foreground">ملخص شامل للرواتب</span>
                </Button>
                <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                  <Calculator className="h-8 w-8" />
                  <span className="font-medium">تقرير البدلات والخصميات</span>
                  <span className="text-sm text-muted-foreground">تفاصيل البدلات والخصميات</span>
                </Button>
                <Button variant="outline" className="p-6 h-auto flex-col gap-2">
                  <TrendingUp className="h-8 w-8" />
                  <span className="font-medium">تحليل اتجاهات الرواتب</span>
                  <span className="text-sm text-muted-foreground">تحليل النمو والاتجاهات</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollManagement;