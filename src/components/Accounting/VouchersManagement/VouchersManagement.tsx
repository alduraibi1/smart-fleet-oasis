import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Receipt, 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Check, 
  X, 
  Clock, 
  Download,
  Plus,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreatePaymentReceiptDialog } from "../PaymentReceipts/CreatePaymentReceiptDialog";
import { CreatePaymentVoucherDialog } from "../PaymentVouchers/CreatePaymentVoucherDialog";

interface PaymentReceipt {
  id: string;
  receipt_number: string;
  customer_name: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  receipt_type: string;
  notes?: string;
  created_at: string;
}

interface PaymentVoucher {
  id: string;
  voucher_number: string;
  recipient_name: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  expense_category: string;
  expense_type: string;
  description: string;
  notes?: string;
  created_at: string;
  requires_higher_approval: boolean;
}

export function VouchersManagement() {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedVoucher, setSelectedVoucher] = useState<PaymentVoucher | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchVouchersData();
  }, []);

  const fetchVouchersData = async () => {
    try {
      setLoading(true);

      // جلب سندات القبض
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('payment_receipts')
        .select('*')
        .order('created_at', { ascending: false });

      if (receiptsError) throw receiptsError;

      // جلب سندات الصرف
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('payment_vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (vouchersError) throw vouchersError;

      setReceipts(receiptsData || []);
      setVouchers(vouchersData || []);

    } catch (error) {
      console.error('Error fetching vouchers data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب بيانات السندات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVoucher = async (voucherId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_vouchers')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approval_date: new Date().toISOString().split('T')[0],
          approval_notes: approvalNotes
        })
        .eq('id', voucherId);

      if (error) throw error;

      toast({
        title: approved ? "تم الموافقة" : "تم الرفض",
        description: `تم ${approved ? 'الموافقة على' : 'رفض'} سند الصرف بنجاح`,
      });

      setApprovalDialog(false);
      setApprovalNotes("");
      setSelectedVoucher(null);
      fetchVouchersData();

    } catch (error) {
      console.error('Error updating voucher:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث حالة السند",
        variant: "destructive",
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'معلق', color: 'bg-gray-100 text-gray-700' },
      'confirmed': { label: 'مؤكد', color: 'bg-green-100 text-green-700' },
      'pending_approval': { label: 'في انتظار الموافقة', color: 'bg-yellow-100 text-yellow-700' },
      'approved': { label: 'موافق عليه', color: 'bg-green-100 text-green-700' },
      'rejected': { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
      'cancelled': { label: 'ملغي', color: 'bg-red-100 text-red-700' },
      'paid': { label: 'مدفوع', color: 'bg-blue-100 text-blue-700' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const getExpenseCategoryLabel = (category: string) => {
    const categoryMap = {
      'maintenance': 'صيانة',
      'fuel': 'وقود',
      'insurance': 'تأمين',
      'owner_commission': 'عمولة مالك',
      'salary': 'راتب',
      'office_expenses': 'مصاريف إدارية',
      'parts_purchase': 'شراء قطع غيار',
      'oil_purchase': 'شراء زيوت',
      'service_fees': 'رسوم خدمات',
      'other': 'أخرى'
    };
    
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  // تصفية البيانات
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || receipt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.recipient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || voucher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // إحصائيات سريعة
  const stats = {
    totalReceipts: receipts.reduce((sum, r) => sum + r.amount, 0),
    totalVouchers: vouchers.reduce((sum, v) => sum + v.amount, 0),
    pendingVouchers: vouchers.filter(v => v.status === 'pending_approval').length,
    pendingReceipts: receipts.filter(r => r.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المقبوضات</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalReceipts)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalVouchers)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صرف معلق</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingVouchers}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">قبض معلق</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingReceipts}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات التصفية والبحث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="رقم السند أو اسم العميل/المستفيد"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="pending_approval">في انتظار الموافقة</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الإجراءات</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                  }}
                  className="flex-1"
                >
                  مسح الفلاتر
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أزرار الإجراءات السريعة */}
      <div className="flex gap-4 flex-wrap">
        <CreatePaymentReceiptDialog />
        <CreatePaymentVoucherDialog />
      </div>

      {/* جداول السندات */}
      <Tabs defaultValue="receipts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipts" className="gap-2">
            <Receipt className="h-4 w-4" />
            سندات القبض ({filteredReceipts.length})
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="gap-2">
            <FileText className="h-4 w-4" />
            سندات الصرف ({filteredVouchers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                سندات القبض
              </CardTitle>
              <CardDescription>
                إدارة ومتابعة سندات القبض والمدفوعات الواردة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم السند</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          لا توجد سندات قبض متطابقة مع المعايير المحددة
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReceipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                          <TableCell>{receipt.customer_name}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(receipt.amount)}
                          </TableCell>
                          <TableCell>{receipt.payment_method}</TableCell>
                          <TableCell>
                            {format(new Date(receipt.payment_date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{receipt.receipt_type}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(receipt.status).color}>
                              {getStatusBadge(receipt.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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
              <CardDescription>
                إدارة ومتابعة سندات الصرف والمدفوعات الصادرة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم السند</TableHead>
                      <TableHead>المستفيد</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          لا توجد سندات صرف متطابقة مع المعايير المحددة
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell className="font-medium">{voucher.voucher_number}</TableCell>
                          <TableCell>{voucher.recipient_name}</TableCell>
                          <TableCell className="font-bold text-red-600">
                            {formatCurrency(voucher.amount)}
                          </TableCell>
                          <TableCell>{getExpenseCategoryLabel(voucher.expense_category)}</TableCell>
                          <TableCell>
                            {format(new Date(voucher.payment_date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusBadge(voucher.status).color}>
                                {getStatusBadge(voucher.status).label}
                              </Badge>
                              {voucher.requires_higher_approval && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {voucher.status === 'pending_approval' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVoucher(voucher);
                                      setApprovalDialog(true);
                                    }}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVoucher(voucher);
                                      setApprovalDialog(true);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* حوار الموافقة */}
      <AlertDialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>موافقة على سند الصرف</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedVoucher && (
                <div className="space-y-2">
                  <p>سند رقم: {selectedVoucher.voucher_number}</p>
                  <p>المستفيد: {selectedVoucher.recipient_name}</p>
                  <p>المبلغ: {formatCurrency(selectedVoucher.amount)}</p>
                  <p>الوصف: {selectedVoucher.description}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-notes">ملاحظات الموافقة</Label>
              <Textarea
                id="approval-notes"
                placeholder="أدخل ملاحظات إضافية (اختياري)"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedVoucher && handleApproveVoucher(selectedVoucher.id, false)}
              className="bg-red-600 hover:bg-red-700"
            >
              رفض
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => selectedVoucher && handleApproveVoucher(selectedVoucher.id, true)}
              className="bg-green-600 hover:bg-green-700"
            >
              موافقة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}