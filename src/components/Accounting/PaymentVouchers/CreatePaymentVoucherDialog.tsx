import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign, User, Car, CreditCard, Printer, Mail, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CreatePaymentVoucherDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: "",
    recipientId: "",
    recipientName: "",
    amount: "",
    paymentMethod: "",
    paymentDate: new Date().toISOString().split('T')[0],
    expenseCategory: "",
    expenseType: "",
    description: "",
    referenceNumber: "",
    invoiceNumber: "",
    checkNumber: "",
    bankDetails: "",
    vehicleId: "",
    contractId: "",
    maintenanceId: "",
    notes: ""
  });

  const { toast } = useToast();
  const [owners, setOwners] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ownerBalance, setOwnerBalance] = useState<any>(null);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);

  // جلب البيانات من قاعدة البيانات
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // جلب المالكين
      const { data: ownersData } = await supabase
        .from('vehicle_owners')
        .select('id, name, phone')
        .eq('is_active', true);

      // جلب الموردين
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('id, name, phone')
        .eq('is_active', true);

      // جلب الفنيين
      const { data: mechanicsData } = await supabase
        .from('mechanics')
        .select('id, name, phone')
        .eq('is_active', true);

      setOwners(ownersData || []);
      setSuppliers(suppliersData || []);
      setMechanics(mechanicsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateVoucherNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `VOC-${year}${month}${day}-${random}`;
  };

  const getRecipientList = () => {
    switch (formData.recipientType) {
      case 'owner':
        return owners;
      case 'supplier':
        return suppliers;
      case 'mechanic':
        return mechanics;
      default:
        return [];
    }
  };

  const handleRecipientSelect = async (recipientId: string) => {
    const recipients = getRecipientList();
    const recipient = recipients.find(r => r.id === recipientId);
    if (recipient) {
      setFormData(prev => ({
        ...prev,
        recipientId,
        recipientName: recipient.name
      }));

      // إذا كان المستفيد مالك مركبة، جلب رصيده
      if (formData.recipientType === 'owner') {
        await fetchOwnerBalance(recipientId);
      }
    }
  };

  const fetchOwnerBalance = async (ownerId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_owner_balance', {
        p_owner_id: ownerId
      });

      if (error) throw error;
      setOwnerBalance(data);
    } catch (error) {
      console.error('Error fetching owner balance:', error);
    }
  };

  const checkBalanceWarning = () => {
    if (formData.recipientType === 'owner' && ownerBalance && formData.amount) {
      const amount = parseFloat(formData.amount);
      const availableBalance = ownerBalance.available_balance;
      setShowBalanceWarning(amount > availableBalance);
    } else {
      setShowBalanceWarning(false);
    }
  };

  // تحديث التحذير عند تغيير المبلغ
  useEffect(() => {
    checkBalanceWarning();
  }, [formData.amount, ownerBalance]);

  const handleSave = async () => {
    if (!formData.recipientType || !formData.recipientName || !formData.amount || 
        !formData.paymentMethod || !formData.expenseCategory || !formData.description) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // إنشاء سند الصرف في قاعدة البيانات
      const { data, error } = await supabase
        .from('payment_vouchers')
        .insert([{
          voucher_number: generateVoucherNumber(),
          recipient_type: formData.recipientType,
          recipient_id: formData.recipientId || null,
          recipient_name: formData.recipientName,
          recipient_phone: '',
          amount: parseFloat(formData.amount),
          payment_method: formData.paymentMethod,
          payment_date: formData.paymentDate,
          expense_category: formData.expenseCategory,
          expense_type: formData.expenseType || 'operational',
          description: formData.description,
          reference_number: formData.referenceNumber,
          check_number: formData.checkNumber,
          bank_details: formData.bankDetails,
          vehicle_id: formData.vehicleId || null,
          contract_id: formData.contractId || null,
          maintenance_id: formData.maintenanceId || null,
          status: requiresApproval() ? 'pending_approval' : 'approved',
          requires_higher_approval: requiresApproval(),
          notes: formData.notes,
          requested_by: (await supabase.auth.getUser()).data.user?.id || '',
          issued_by: (await supabase.auth.getUser()).data.user?.id || ''
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم إنشاء سند الصرف",
        description: `تم إنشاء سند الصرف رقم ${data.voucher_number} بنجاح`,
        variant: "default"
      });

      setOpen(false);
      // Reset form
      setFormData({
        recipientType: "",
        recipientId: "",
        recipientName: "",
        amount: "",
        paymentMethod: "",
        paymentDate: new Date().toISOString().split('T')[0],
        expenseCategory: "",
        expenseType: "",
        description: "",
        referenceNumber: "",
        invoiceNumber: "",
        checkNumber: "",
        bankDetails: "",
        vehicleId: "",
        contractId: "",
        maintenanceId: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء سند الصرف",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const requiresApproval = () => {
    const amount = Number(formData.amount);
    return amount > 5000; // يتطلب موافقة إذا كان المبلغ أكبر من 5000 ريال
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          إنشاء سند صرف
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            إنشاء سند صرف جديد
          </DialogTitle>
          <DialogDescription>
            إصدار سند صرف للمدفوعات والمصروفات
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-4">
            {/* Recipient Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  معلومات المستفيد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipientType">نوع المستفيد</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, recipientType: value, recipientId: "", recipientName: "" }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المستفيد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">مالك مركبة</SelectItem>
                      <SelectItem value="supplier">مورد</SelectItem>
                      <SelectItem value="mechanic">فني صيانة</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recipientType && formData.recipientType !== 'other' && (
                  <div>
                    <Label htmlFor="recipient">اختيار المستفيد</Label>
                    <Select onValueChange={handleRecipientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستفيد" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRecipientList().map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            {recipient.name} ({recipient.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.recipientType === 'other' && (
                  <div>
                    <Label htmlFor="recipientName">اسم المستفيد</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                      placeholder="أدخل اسم المستفيد"
                    />
                  </div>
                )}

                {/* عرض معلومات الرصيد للمالك */}
                {formData.recipientType === 'owner' && ownerBalance && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">رصيد المالك</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">إجمالي المقبوضات:</span>
                          <span className="font-bold text-green-600 mr-2">
                            {formatCurrency(ownerBalance.total_receipts)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">إجمالي المصروفات:</span>
                          <span className="font-bold text-red-600 mr-2">
                            {formatCurrency(ownerBalance.total_vouchers)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">الرصيد المتاح:</span>
                          <span className={`font-bold mr-2 ${ownerBalance.available_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(ownerBalance.available_balance)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  تفاصيل الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">المبلغ (ريال سعودي)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                    {requiresApproval() && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-orange-600">يتطلب موافقة إدارية</span>
                      </div>
                    )}
                    {showBalanceWarning && (
                      <div className="flex items-center gap-1 mt-1 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">
                          تحذير: المبلغ المطلوب ({formatCurrency(parseFloat(formData.amount) || 0)}) 
                          أكبر من الرصيد المتاح ({formatCurrency(ownerBalance?.available_balance || 0)})
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">تاريخ الدفع</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقداً</SelectItem>
                      <SelectItem value="transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">وصف الدفعة</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف مختصر للدفعة"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expense Classification */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">تصنيف المصروف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expenseCategory">فئة المصروف</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, expenseCategory: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة المصروف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="fuel">وقود</SelectItem>
                      <SelectItem value="insurance">تأمين</SelectItem>
                      <SelectItem value="owner_commission">عمولة مالك</SelectItem>
                      <SelectItem value="salary">راتب</SelectItem>
                      <SelectItem value="office_expenses">مصروفات مكتبية</SelectItem>
                      <SelectItem value="deposit_refund">استرداد وديعة</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expenseType">نوع المصروف</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, expenseType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المصروف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">تشغيلي</SelectItem>
                      <SelectItem value="capital">رأسمالي</SelectItem>
                      <SelectItem value="administrative">إداري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reference Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  تفاصيل المرجع (اختياري)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referenceNumber">رقم المرجع</Label>
                    <Input
                      id="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                      placeholder="رقم المرجع"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      placeholder="رقم الفاتورة"
                    />
                  </div>
                </div>

                {formData.paymentMethod === 'check' && (
                  <div>
                    <Label htmlFor="checkNumber">رقم الشيك</Label>
                    <Input
                      id="checkNumber"
                      value={formData.checkNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkNumber: e.target.value }))}
                      placeholder="رقم الشيك"
                    />
                  </div>
                )}

                {formData.paymentMethod === 'transfer' && (
                  <div>
                    <Label htmlFor="bankDetails">تفاصيل البنك</Label>
                    <Input
                      id="bankDetails"
                      value={formData.bankDetails}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankDetails: e.target.value }))}
                      placeholder="اسم البنك وتفاصيل إضافية"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">معاينة سند الصرف</CardTitle>
                <CardDescription className="text-center">
                  رقم السند: {generateVoucherNumber()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-lg font-bold">سند صرف</h3>
                  <p className="text-sm text-muted-foreground">شركة تأجير المركبات</p>
                  <p className="text-xs text-muted-foreground">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
                </div>

                {/* Recipient Info */}
                {formData.recipientName && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">المستفيد:</span>
                      <span className="text-sm font-medium">{formData.recipientName}</span>
                    </div>
                    {formData.recipientType && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">النوع:</span>
                        <Badge variant="outline">
                          {formData.recipientType === 'owner' ? 'مالك مركبة' :
                           formData.recipientType === 'supplier' ? 'مورد' :
                           formData.recipientType === 'mechanic' ? 'فني صيانة' :
                           formData.recipientType === 'employee' ? 'موظف' : 'أخرى'}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Details */}
                <div className="border rounded-lg p-3 bg-muted/20">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">المبلغ المدفوع:</span>
                      <span className="text-lg font-bold text-destructive">
                        {formData.amount ? formatCurrency(Number(formData.amount)) : "0 ريال"}
                      </span>
                    </div>
                    {requiresApproval() && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">الحالة:</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          يتطلب موافقة
                        </Badge>
                      </div>
                    )}
                    {formData.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">طريقة الدفع:</span>
                        <Badge variant="outline">
                          {formData.paymentMethod === 'cash' ? 'نقداً' :
                           formData.paymentMethod === 'transfer' ? 'تحويل بنكي' :
                           formData.paymentMethod === 'check' ? 'شيك' : ''}
                        </Badge>
                      </div>
                    )}
                    {formData.description && (
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground">الوصف:</span>
                        <p className="text-sm font-medium mt-1">{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expense Classification */}
                {(formData.expenseCategory || formData.expenseType) && (
                  <div className="space-y-2 pt-2 border-t">
                    {formData.expenseCategory && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">فئة المصروف:</span>
                        <Badge variant="secondary">
                          {formData.expenseCategory === 'maintenance' ? 'صيانة' :
                           formData.expenseCategory === 'fuel' ? 'وقود' :
                           formData.expenseCategory === 'insurance' ? 'تأمين' :
                           formData.expenseCategory === 'owner_commission' ? 'عمولة مالك' :
                           formData.expenseCategory === 'salary' ? 'راتب' :
                           formData.expenseCategory === 'office_expenses' ? 'مصروفات مكتبية' :
                           formData.expenseCategory === 'deposit_refund' ? 'استرداد وديعة' : 'أخرى'}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Reference Details */}
                {(formData.referenceNumber || formData.invoiceNumber || formData.checkNumber) && (
                  <div className="space-y-2 pt-2 border-t">
                    {formData.referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">رقم المرجع:</span>
                        <span className="text-sm font-medium">{formData.referenceNumber}</span>
                      </div>
                    )}
                    {formData.invoiceNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">رقم الفاتورة:</span>
                        <span className="text-sm font-medium">{formData.invoiceNumber}</span>
                      </div>
                    )}
                    {formData.checkNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">رقم الشيك:</span>
                        <span className="text-sm font-medium">{formData.checkNumber}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {formData.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">ملاحظات:</p>
                    <p className="text-sm">{formData.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t text-center space-y-2">
                  <p className="text-xs text-muted-foreground">توقيع المستلم: _______________</p>
                  <p className="text-xs text-muted-foreground">توقيع المحاسب: _______________</p>
                  <p className="text-xs text-muted-foreground">
                    هذا السند يؤكد صرف المبلغ المذكور أعلاه
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              إرسال بريد إلكتروني
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "جاري الحفظ..." : "حفظ وإصدار السند"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}