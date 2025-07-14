import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Receipt, 
  FileText, 
  Percent,
  Search, 
  Filter,
  Download,
  Eye,
  Printer,
  MoreHorizontal,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Plus
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function VouchersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isCreateReceiptOpen, setIsCreateReceiptOpen] = useState(false);
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [isCreateDiscountOpen, setIsCreateDiscountOpen] = useState(false);

  // Mock data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
  const paymentReceipts = [
    {
      id: "1",
      receiptNumber: "REC-20241215-001",
      customerName: "أحمد محمد علي",
      amount: 15000,
      paymentMethod: "cash",
      type: "rental_payment",
      status: "confirmed",
      issuedAt: new Date("2024-12-15"),
      issuedBy: "محمد السالم"
    },
    {
      id: "2", 
      receiptNumber: "REC-20241215-002",
      customerName: "فاطمة سالم",
      amount: 2000,
      paymentMethod: "transfer",
      type: "security_deposit",
      status: "pending",
      issuedAt: new Date("2024-12-15"),
      issuedBy: "علي الأحمد"
    },
    {
      id: "3",
      receiptNumber: "REC-20241214-003", 
      customerName: "خالد عبدالله",
      amount: 500,
      paymentMethod: "credit_card",
      type: "additional_charges",
      status: "confirmed",
      issuedAt: new Date("2024-12-14"),
      issuedBy: "محمد السالم"
    }
  ];

  const paymentVouchers = [
    {
      id: "1",
      voucherNumber: "VOC-20241215-001",
      recipientName: "محمد أحمد الفهد",
      amount: 9000,
      expenseCategory: "owner_commission",
      status: "paid",
      issuedAt: new Date("2024-12-15"),
      issuedBy: "علي الأحمد"
    },
    {
      id: "2",
      voucherNumber: "VOC-20241214-002",
      recipientName: "ورشة الماهر للصيانة",
      amount: 1200,
      expenseCategory: "maintenance",
      status: "pending",
      issuedAt: new Date("2024-12-14"),
      issuedBy: "محمد السالم"
    },
    {
      id: "3",
      voucherNumber: "VOC-20241213-003",
      recipientName: "شركة التأمين المتحدة",
      amount: 3500,
      expenseCategory: "insurance",
      status: "paid",
      issuedAt: new Date("2024-12-13"),
      issuedBy: "علي الأحمد"
    }
  ];

  const discountVouchers = [
    {
      id: "1",
      voucherNumber: "DIS-20241215-001",
      customerName: "أحمد محمد علي",
      originalAmount: 15000,
      discountAmount: 1500,
      discountPercentage: 10,
      discountType: "loyalty_customer",
      status: "approved",
      issuedAt: new Date("2024-12-15"),
      appliedAt: new Date("2024-12-15")
    },
    {
      id: "2",
      voucherNumber: "DIS-20241214-002",
      customerName: "فاطمة سالم",
      originalAmount: 12000,
      discountAmount: 2400,
      discountPercentage: 20,
      discountType: "early_payment",
      status: "pending",
      issuedAt: new Date("2024-12-14"),
      appliedAt: null
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "paid":
      case "approved":
      case "applied":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />مؤكد</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />معلق</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      'cash': 'نقداً',
      'transfer': 'تحويل بنكي',
      'credit_card': 'بطاقة ائتمان',
      'check': 'شيك'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getExpenseCategoryLabel = (category: string) => {
    const categories = {
      'owner_commission': 'عمولة مالك',
      'maintenance': 'صيانة',
      'fuel': 'وقود',
      'insurance': 'تأمين',
      'salary': 'راتب',
      'office_expenses': 'مصروفات مكتبية'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getDiscountTypeLabel = (type: string) => {
    const types = {
      'early_payment': 'دفع مبكر',
      'long_term_rental': 'إيجار طويل المدى',
      'loyalty_customer': 'عميل مميز',
      'promotional': 'ترويجي',
      'compensation': 'تعويضي'
    };
    return types[type as keyof typeof types] || type;
  };

  // Summary calculations
  const totalReceipts = paymentReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalVouchers = paymentVouchers.reduce((sum, v) => sum + v.amount, 0);
  const totalDiscounts = discountVouchers.reduce((sum, d) => sum + d.discountAmount, 0);
  const pendingReceipts = paymentReceipts.filter(r => r.status === 'pending').length;
  const pendingVouchers = paymentVouchers.filter(v => v.status === 'pending').length;
  const pendingDiscounts = discountVouchers.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة السندات المالية</h2>
          <p className="text-muted-foreground">عرض وإدارة جميع السندات المصدرة في النظام</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateReceiptOpen(true)}
            size="sm" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            سند قبض
          </Button>
          <Button 
            onClick={() => setIsCreatePaymentOpen(true)}
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            سند صرف
          </Button>
          <Button 
            onClick={() => setIsCreateDiscountOpen(true)}
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            سند خصم
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير جميع السندات
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4 text-green-600" />
              سندات القبض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalReceipts)}</div>
            <div className="text-xs text-muted-foreground">{paymentReceipts.length} سند</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              سندات الصرف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totalVouchers)}</div>
            <div className="text-xs text-muted-foreground">{paymentVouchers.length} سند</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-orange-600" />
              سندات الخصم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{formatCurrency(totalDiscounts)}</div>
            <div className="text-xs text-muted-foreground">{discountVouchers.length} سند</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              معلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{pendingReceipts + pendingVouchers + pendingDiscounts}</div>
            <div className="text-xs text-muted-foreground">تحتاج متابعة</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              صافي التدفق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{formatCurrency(totalReceipts - totalVouchers)}</div>
            <div className="text-xs text-muted-foreground">الوارد - الصادر</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              توفير الخصومات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">{formatCurrency(totalDiscounts)}</div>
            <div className="text-xs text-muted-foreground">إجمالي الخصومات</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            المرشحات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="رقم السند أو اسم العميل..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">النوع</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="receipt">سند قبض</SelectItem>
                  <SelectItem value="voucher">سند صرف</SelectItem>
                  <SelectItem value="discount">سند خصم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التواريخ</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different voucher types */}
      <Tabs defaultValue="receipts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            سندات القبض ({paymentReceipts.length})
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            سندات الصرف ({paymentVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            سندات الخصم ({discountVouchers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                سندات القبض
              </CardTitle>
              <CardDescription>جميع سندات القبض المصدرة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-medium">رقم السند</th>
                      <th className="text-right p-3 font-medium">العميل</th>
                      <th className="text-right p-3 font-medium">المبلغ</th>
                      <th className="text-right p-3 font-medium">طريقة الدفع</th>
                      <th className="text-right p-3 font-medium">النوع</th>
                      <th className="text-right p-3 font-medium">التاريخ</th>
                      <th className="text-right p-3 font-medium">الحالة</th>
                      <th className="text-right p-3 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentReceipts.map((receipt) => (
                      <tr key={receipt.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-mono text-sm">{receipt.receiptNumber}</td>
                        <td className="p-3">{receipt.customerName}</td>
                        <td className="p-3 font-bold text-green-600">{formatCurrency(receipt.amount)}</td>
                        <td className="p-3">
                          <Badge variant="outline">{getPaymentMethodLabel(receipt.paymentMethod)}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            {receipt.type === 'rental_payment' ? 'دفعة إيجار' :
                             receipt.type === 'security_deposit' ? 'تأمين' :
                             receipt.type === 'additional_charges' ? 'رسوم إضافية' : receipt.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{receipt.issuedAt.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3">{getStatusBadge(receipt.status)}</td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Printer className="h-4 w-4" />
                                طباعة
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="h-4 w-4" />
                                تحميل PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                سندات الصرف
              </CardTitle>
              <CardDescription>جميع سندات الصرف المصدرة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-medium">رقم السند</th>
                      <th className="text-right p-3 font-medium">المستفيد</th>
                      <th className="text-right p-3 font-medium">المبلغ</th>
                      <th className="text-right p-3 font-medium">فئة المصروف</th>
                      <th className="text-right p-3 font-medium">التاريخ</th>
                      <th className="text-right p-3 font-medium">الحالة</th>
                      <th className="text-right p-3 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentVouchers.map((voucher) => (
                      <tr key={voucher.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-mono text-sm">{voucher.voucherNumber}</td>
                        <td className="p-3">{voucher.recipientName}</td>
                        <td className="p-3 font-bold text-red-600">{formatCurrency(voucher.amount)}</td>
                        <td className="p-3">
                          <Badge variant="outline">{getExpenseCategoryLabel(voucher.expenseCategory)}</Badge>
                        </td>
                        <td className="p-3 text-sm">{voucher.issuedAt.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3">{getStatusBadge(voucher.status)}</td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Printer className="h-4 w-4" />
                                طباعة
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="h-4 w-4" />
                                تحميل PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                سندات الخصم
              </CardTitle>
              <CardDescription>جميع سندات الخصم المصدرة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-medium">رقم السند</th>
                      <th className="text-right p-3 font-medium">العميل</th>
                      <th className="text-right p-3 font-medium">المبلغ الأصلي</th>
                      <th className="text-right p-3 font-medium">الخصم</th>
                      <th className="text-right p-3 font-medium">النسبة</th>
                      <th className="text-right p-3 font-medium">النوع</th>
                      <th className="text-right p-3 font-medium">التاريخ</th>
                      <th className="text-right p-3 font-medium">الحالة</th>
                      <th className="text-right p-3 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discountVouchers.map((discount) => (
                      <tr key={discount.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-mono text-sm">{discount.voucherNumber}</td>
                        <td className="p-3">{discount.customerName}</td>
                        <td className="p-3 font-medium">{formatCurrency(discount.originalAmount)}</td>
                        <td className="p-3 font-bold text-orange-600">{formatCurrency(discount.discountAmount)}</td>
                        <td className="p-3">
                          <Badge variant="outline">{discount.discountPercentage}%</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">{getDiscountTypeLabel(discount.discountType)}</Badge>
                        </td>
                        <td className="p-3 text-sm">{discount.issuedAt.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3">{getStatusBadge(discount.status)}</td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Printer className="h-4 w-4" />
                                طباعة
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="h-4 w-4" />
                                تحميل PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}