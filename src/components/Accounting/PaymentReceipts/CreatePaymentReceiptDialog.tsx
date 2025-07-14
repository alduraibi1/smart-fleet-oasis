import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, DollarSign, User, Car, CreditCard, Printer, Mail, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreatePaymentReceiptDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    contractId: "",
    customerId: "",
    customerName: "",
    vehicleId: "",
    plateNumber: "",
    amount: "",
    paymentMethod: "",
    paymentDate: new Date().toISOString().split('T')[0],
    type: "",
    referenceNumber: "",
    checkNumber: "",
    bankDetails: "",
    notes: ""
  });

  const { toast } = useToast();

  // Mock data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
  const mockContracts = [
    { id: "1", contractNumber: "C-2024-001", customerName: "أحمد محمد علي", plateNumber: "أ ب ج 123", amount: 15000 },
    { id: "2", contractNumber: "C-2024-002", customerName: "فاطمة سالم", plateNumber: "د هـ و 456", amount: 12000 },
    { id: "3", contractNumber: "C-2024-003", customerName: "خالد عبدالله", plateNumber: "ز ح ط 789", amount: 18000 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC-${year}${month}${day}-${random}`;
  };

  const handleContractSelect = (contractId: string) => {
    const contract = mockContracts.find(c => c.id === contractId);
    if (contract) {
      setFormData(prev => ({
        ...prev,
        contractId,
        customerId: contractId,
        customerName: contract.customerName,
        plateNumber: contract.plateNumber,
        amount: contract.amount.toString()
      }));
    }
  };

  const handleSave = () => {
    if (!formData.contractId || !formData.amount || !formData.paymentMethod || !formData.type) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // في التطبيق الحقيقي سيتم حفظ البيانات في قاعدة البيانات
    toast({
      title: "تم إنشاء سند القبض",
      description: `تم إنشاء سند القبض رقم ${generateReceiptNumber()} بنجاح`,
      variant: "default"
    });

    setOpen(false);
    setFormData({
      contractId: "",
      customerId: "",
      customerName: "",
      vehicleId: "",
      plateNumber: "",
      amount: "",
      paymentMethod: "",
      paymentDate: new Date().toISOString().split('T')[0],
      type: "",
      referenceNumber: "",
      checkNumber: "",
      bankDetails: "",
      notes: ""
    });
  };

  const handlePrint = () => {
    toast({
      title: "جاري الطباعة",
      description: "يتم تحضير سند القبض للطباعة...",
      variant: "default"
    });
  };

  const handleEmail = () => {
    toast({
      title: "تم إرسال البريد الإلكتروني",
      description: "تم إرسال سند القبض إلى العميل عبر البريد الإلكتروني",
      variant: "default"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Receipt className="h-4 w-4" />
          إنشاء سند قبض
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            إنشاء سند قبض جديد
          </DialogTitle>
          <DialogDescription>
            إصدار سند قبض للعميل مع جميع التفاصيل المطلوبة
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-4">
            {/* Contract Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  معلومات العقد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contract">اختيار العقد</Label>
                  <Select onValueChange={handleContractSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العقد" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockContracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.contractNumber} - {contract.customerName} ({contract.plateNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.customerName && (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">العميل:</span>
                      <span className="text-sm font-medium">{formData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">رقم اللوحة:</span>
                      <span className="text-sm font-medium">{formData.plateNumber}</span>
                    </div>
                  </div>
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
                      <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">نوع الدفعة</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الدفعة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rental_payment">دفعة إيجار</SelectItem>
                      <SelectItem value="security_deposit">تأمين</SelectItem>
                      <SelectItem value="additional_charges">رسوم إضافية</SelectItem>
                      <SelectItem value="penalty">غرامة</SelectItem>
                      <SelectItem value="refund">استرداد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reference Details */}
            {(formData.paymentMethod === 'transfer' || formData.paymentMethod === 'check') && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    تفاصيل المرجع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="referenceNumber">رقم المرجع</Label>
                    <Input
                      id="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                      placeholder="رقم التحويل أو المرجع"
                    />
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
            )}

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
                <CardTitle className="text-center">معاينة سند القبض</CardTitle>
                <CardDescription className="text-center">
                  رقم السند: {generateReceiptNumber()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-lg font-bold">سند قبض</h3>
                  <p className="text-sm text-muted-foreground">شركة تأجير المركبات</p>
                  <p className="text-xs text-muted-foreground">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
                </div>

                {/* Customer Info */}
                {formData.customerName && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">العميل:</span>
                      <span className="text-sm font-medium">{formData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">المركبة:</span>
                      <span className="text-sm font-medium">{formData.plateNumber}</span>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="border rounded-lg p-3 bg-muted/20">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">المبلغ المستلم:</span>
                      <span className="text-lg font-bold text-primary">
                        {formData.amount ? formatCurrency(Number(formData.amount)) : "0 ريال"}
                      </span>
                    </div>
                    {formData.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">طريقة الدفع:</span>
                        <Badge variant="outline">
                          {formData.paymentMethod === 'cash' ? 'نقداً' :
                           formData.paymentMethod === 'transfer' ? 'تحويل بنكي' :
                           formData.paymentMethod === 'credit_card' ? 'بطاقة ائتمان' :
                           formData.paymentMethod === 'check' ? 'شيك' : ''}
                        </Badge>
                      </div>
                    )}
                    {formData.type && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">نوع الدفعة:</span>
                        <Badge variant="secondary">
                          {formData.type === 'rental_payment' ? 'دفعة إيجار' :
                           formData.type === 'security_deposit' ? 'تأمين' :
                           formData.type === 'additional_charges' ? 'رسوم إضافية' :
                           formData.type === 'penalty' ? 'غرامة' :
                           formData.type === 'refund' ? 'استرداد' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reference Details */}
                {(formData.referenceNumber || formData.checkNumber) && (
                  <div className="space-y-2 pt-2 border-t">
                    {formData.referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">رقم المرجع:</span>
                        <span className="text-sm font-medium">{formData.referenceNumber}</span>
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
                  <p className="text-xs text-muted-foreground">
                    هذا السند يؤكد استلام المبلغ المذكور أعلاه
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" onClick={handleEmail} className="gap-2">
              <Mail className="h-4 w-4" />
              إرسال بريد إلكتروني
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              حفظ وإصدار السند
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}