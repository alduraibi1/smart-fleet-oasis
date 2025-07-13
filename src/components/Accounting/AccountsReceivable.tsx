import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, Search, AlertTriangle, DollarSign, Clock, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function AccountsReceivable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for accounts receivable
  const receivables = [
    {
      id: "AR001",
      customerName: "أحمد محمد علي",
      contractNumber: "C-2024-001",
      amount: 15000,
      dueDate: "2024-01-15",
      daysPastDue: 5,
      status: "overdue",
      phone: "0501234567",
      email: "ahmed@email.com"
    },
    {
      id: "AR002", 
      customerName: "فاطمة أحمد السالم",
      contractNumber: "C-2024-002",
      amount: 8500,
      dueDate: "2024-01-20",
      daysPastDue: 0,
      status: "current",
      phone: "0507654321",
      email: "fatima@email.com"
    },
    {
      id: "AR003",
      customerName: "خالد عبدالله النجار",
      contractNumber: "C-2024-003", 
      amount: 12000,
      dueDate: "2024-01-10",
      daysPastDue: 10,
      status: "overdue",
      phone: "0551234567",
      email: "khalid@email.com"
    },
    {
      id: "AR004",
      customerName: "نورا سعد الغامدي",
      contractNumber: "C-2024-004",
      amount: 6000,
      dueDate: "2024-01-25",
      daysPastDue: 0,
      status: "current",
      phone: "0509876543",
      email: "nora@email.com"
    },
    {
      id: "AR005",
      customerName: "محمد علي الحربي",
      contractNumber: "C-2024-005",
      amount: 25000,
      dueDate: "2023-12-30",
      daysPastDue: 20,
      status: "critical",
      phone: "0556789012",
      email: "mohammed@email.com"
    }
  ];

  const summary = {
    totalReceivables: receivables.reduce((sum, r) => sum + r.amount, 0),
    currentReceivables: receivables.filter(r => r.status === "current").reduce((sum, r) => sum + r.amount, 0),
    overdueReceivables: receivables.filter(r => r.status === "overdue").reduce((sum, r) => sum + r.amount, 0),
    criticalReceivables: receivables.filter(r => r.status === "critical").reduce((sum, r) => sum + r.amount, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string, daysPastDue: number) => {
    switch (status) {
      case "current":
        return <Badge variant="default">مستحق</Badge>;
      case "overdue":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">متأخر {daysPastDue} يوم</Badge>;
      case "critical":
        return <Badge variant="destructive">حرج {daysPastDue} يوم</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const filteredReceivables = receivables.filter(receivable => {
    const matchesSearch = receivable.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receivable.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || receivable.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الحسابات المدينة</h2>
          <p className="text-muted-foreground">متابعة المستحقات والديون على العملاء</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            تقرير شهري
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير قائمة المدينين
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              إجمالي المستحقات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary.totalReceivables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {receivables.length} عميل
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              المستحقات الجارية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.currentReceivables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">في موعدها</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              المستحقات المتأخرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.overdueReceivables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">تحتاج متابعة</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              المستحقات الحرجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.criticalReceivables)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجراء فوري مطلوب</p>
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
                  placeholder="البحث بالاسم أو رقم العقد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="حالة المستحقات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="current">المستحقات الجارية</SelectItem>
                <SelectItem value="overdue">المستحقات المتأخرة</SelectItem>
                <SelectItem value="critical">المستحقات الحرجة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receivables Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الحسابات المدينة</CardTitle>
          <CardDescription>تفاصيل كافة المستحقات والديون</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">اسم العميل</th>
                  <th className="text-right p-3 font-medium">رقم العقد</th>
                  <th className="text-right p-3 font-medium">المبلغ المستحق</th>
                  <th className="text-right p-3 font-medium">تاريخ الاستحقاق</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivables.map((receivable) => (
                  <tr key={receivable.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{receivable.customerName}</div>
                        <div className="text-sm text-muted-foreground">{receivable.phone}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{receivable.contractNumber}</td>
                    <td className="p-3 font-bold text-primary">{formatCurrency(receivable.amount)}</td>
                    <td className="p-3">{new Date(receivable.dueDate).toLocaleDateString('ar-SA')}</td>
                    <td className="p-3">{getStatusBadge(receivable.status, receivable.daysPastDue)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Mail className="h-3 w-3" />
                              إرسال تذكير
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>إرسال تذكير دفع</DialogTitle>
                              <DialogDescription>
                                إرسال تذكير للعميل {receivable.customerName} بالمبلغ المستحق
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">رسالة التذكير</label>
                                <Textarea 
                                  placeholder="اكتب رسالة مخصصة للعميل..."
                                  className="mt-2"
                                  defaultValue={`عزيزي ${receivable.customerName}،\n\nنود تذكيركم بوجود مبلغ مستحق قدره ${formatCurrency(receivable.amount)} للعقد رقم ${receivable.contractNumber}.\n\nتاريخ الاستحقاق: ${new Date(receivable.dueDate).toLocaleDateString('ar-SA')}\n\nيرجى التواصل معنا لتسوية المبلغ.\n\nشكراً لكم`}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1 gap-2">
                                  <Mail className="h-4 w-4" />
                                  إرسال عبر الإيميل
                                </Button>
                                <Button variant="outline" className="flex-1 gap-2">
                                  <Phone className="h-4 w-4" />
                                  إرسال SMS
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="default" className="gap-2">
                          <DollarSign className="h-3 w-3" />
                          تسجيل دفعة
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <Mail className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">إرسال تذكيرات جماعية</h3>
                <p className="text-sm text-muted-foreground">إرسال تذكيرات لجميع المتأخرين</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">تقرير أعمار الديون</h3>
                <p className="text-sm text-muted-foreground">تحليل توزيع الديون حسب العمر</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <DollarSign className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">إعداد خطة تحصيل</h3>
                <p className="text-sm text-muted-foreground">وضع استراتيجية لتحصيل الديون</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}