import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, Search, FileText, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AccountsPayable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for accounts payable
  const payables = [
    {
      id: "AP001",
      vendorName: "ورشة الأمين للصيانة",
      invoiceNumber: "INV-2024-001",
      amount: 8500,
      dueDate: "2024-01-25",
      invoiceDate: "2024-01-10",
      status: "pending",
      category: "maintenance",
      description: "صيانة مركبة تويوتا كامري"
    },
    {
      id: "AP002",
      vendorName: "شركة قطع الغيار الحديثة",
      invoiceNumber: "INV-2024-002", 
      amount: 3200,
      dueDate: "2024-01-20",
      invoiceDate: "2024-01-05",
      status: "approved",
      category: "parts",
      description: "قطع غيار متنوعة"
    },
    {
      id: "AP003",
      vendorName: "محطة الوقود المتحدة",
      invoiceNumber: "INV-2024-003",
      amount: 1500,
      dueDate: "2024-01-15",
      invoiceDate: "2024-01-01",
      status: "overdue",
      category: "fuel",
      description: "فاتورة وقود شهر ديسمبر"
    },
    {
      id: "AP004",
      vendorName: "الأستاذ أحمد - ميكانيكي",
      invoiceNumber: "INV-2024-004",
      amount: 1200,
      dueDate: "2024-01-30",
      invoiceDate: "2024-01-15",
      status: "pending",
      category: "labor",
      description: "أجور عمالة لأسبوع"
    },
    {
      id: "AP005",
      vendorName: "شركة التأمين الوطنية",
      invoiceNumber: "INV-2024-005",
      amount: 15000,
      dueDate: "2024-02-01",
      invoiceDate: "2024-01-01",
      status: "approved",
      category: "insurance", 
      description: "تجديد تأمين الأسطول"
    }
  ];

  const summary = {
    totalPayables: payables.reduce((sum, p) => sum + p.amount, 0),
    pendingPayables: payables.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
    approvedPayables: payables.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount, 0),
    overduePayables: payables.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">معتمد</Badge>;
      case "overdue":
        return <Badge variant="destructive">متأخر</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">مدفوع</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      maintenance: "صيانة",
      parts: "قطع غيار",
      fuel: "وقود",
      labor: "عمالة",
      insurance: "تأمين",
      other: "أخرى"
    };
    return categories[category] || category;
  };

  const filteredPayables = payables.filter(payable => {
    const matchesSearch = payable.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payable.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payable.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الحسابات الدائنة</h2>
          <p className="text-muted-foreground">متابعة المدفوعات والالتزامات المالية</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة فاتورة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
                <DialogDescription>إدخال تفاصيل فاتورة جديدة للمورد</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vendor">اسم المورد</Label>
                  <Input id="vendor" placeholder="اسم المورد أو الشركة" />
                </div>
                <div>
                  <Label htmlFor="invoice-num">رقم الفاتورة</Label>
                  <Input id="invoice-num" placeholder="رقم الفاتورة" />
                </div>
                <div>
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة الفاتورة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="parts">قطع غيار</SelectItem>
                      <SelectItem value="fuel">وقود</SelectItem>
                      <SelectItem value="labor">عمالة</SelectItem>
                      <SelectItem value="insurance">تأمين</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">وصف الفاتورة</Label>
                  <Textarea id="description" placeholder="تفاصيل الفاتورة..." />
                </div>
                <Button className="w-full">حفظ الفاتورة</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              إجمالي المستحقات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary.totalPayables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {payables.length} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              في الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pendingPayables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">تحتاج موافقة</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              معتمدة للدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.approvedPayables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">جاهزة للسداد</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              متأخرة الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.overduePayables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">تحتاج سداد فوري</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>فلترة وبحث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث بالمورد أو رقم الفاتورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="حالة الفاتورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="approved">معتمدة</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payables Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الحسابات الدائنة</CardTitle>
          <CardDescription>تفاصيل كافة الفواتير والمدفوعات المستحقة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">المورد</th>
                  <th className="text-right p-3 font-medium">رقم الفاتورة</th>
                  <th className="text-right p-3 font-medium">المبلغ</th>
                  <th className="text-right p-3 font-medium">الفئة</th>
                  <th className="text-right p-3 font-medium">تاريخ الاستحقاق</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayables.map((payable) => (
                  <tr key={payable.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{payable.vendorName}</div>
                        <div className="text-sm text-muted-foreground">{payable.description}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{payable.invoiceNumber}</td>
                    <td className="p-3 font-bold text-primary">{formatCurrency(payable.amount)}</td>
                    <td className="p-3">
                      <Badge variant="outline">{getCategoryLabel(payable.category)}</Badge>
                    </td>
                    <td className="p-3">{new Date(payable.dueDate).toLocaleDateString('ar-SA')}</td>
                    <td className="p-3">{getStatusBadge(payable.status)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {payable.status === "pending" && (
                          <Button size="sm" variant="default" className="gap-2">
                            <CheckCircle className="h-3 w-3" />
                            اعتماد
                          </Button>
                        )}
                        {payable.status === "approved" && (
                          <Button size="sm" variant="outline" className="gap-2">
                            <FileText className="h-3 w-3" />
                            دفع
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          تفاصيل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>سير عمل الموافقات</CardTitle>
          <CardDescription>خطوات معالجة الفواتير والمدفوعات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-medium">استلام الفاتورة</h3>
              <p className="text-sm text-muted-foreground mt-1">إدخال تفاصيل الفاتورة</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">المراجعة</h3>
              <p className="text-sm text-muted-foreground mt-1">التحقق من صحة البيانات</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">الموافقة</h3>
              <p className="text-sm text-muted-foreground mt-1">اعتماد الدفع من المدير</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium">الدفع</h3>
              <p className="text-sm text-muted-foreground mt-1">تنفيذ الدفعة للمورد</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">موافقة جماعية</h3>
                <p className="text-sm text-muted-foreground">اعتماد عدة فواتير معاً</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <CalendarIcon className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">جدولة المدفوعات</h3>
                <p className="text-sm text-muted-foreground">تحديد مواعيد الدفع</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">تقرير الموردين</h3>
                <p className="text-sm text-muted-foreground">تحليل أداء الموردين</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}