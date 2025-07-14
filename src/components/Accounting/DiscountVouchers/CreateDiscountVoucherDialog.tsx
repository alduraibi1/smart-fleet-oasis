import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Percent, Calendar, DollarSign, User, Car, AlertTriangle, Printer, Mail, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreateDiscountVoucherDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    contractId: "",
    customerId: "",
    customerName: "",
    originalAmount: "",
    discountAmount: "",
    discountPercentage: "",
    discountType: "",
    discountReason: "",
    requiresHigherApproval: false,
    notes: ""
  });

  const { toast } = useToast();

  // Mock data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
  const mockContracts = [
    { id: "1", contractNumber: "C-2024-001", customerName: "أحمد محمد علي", totalAmount: 15000, status: "active" },
    { id: "2", contractNumber: "C-2024-002", customerName: "فاطمة سالم", totalAmount: 12000, status: "active" },
    { id: "3", contractNumber: "C-2024-003", customerName: "خالد عبدالله", totalAmount: 18000, status: "pending" }
  ];

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
    return `DIS-${year}${month}${day}-${random}`;
  };

  const handleContractSelect = (contractId: string) => {
    const contract = mockContracts.find(c => c.id === contractId);
    if (contract) {
      setFormData(prev => ({
        ...prev,
        contractId,
        customerId: contractId,
        customerName: contract.customerName,
        originalAmount: contract.totalAmount.toString()
      }));
    }
  };

  const handleDiscountAmountChange = (value: string) => {
    const discountAmount = Number(value);
    const originalAmount = Number(formData.originalAmount);
    
    if (originalAmount > 0) {
      const percentage = ((discountAmount / originalAmount) * 100).toFixed(2);
      setFormData(prev => ({
        ...prev,
        discountAmount: value,
        discountPercentage: percentage,
        requiresHigherApproval: discountAmount > (originalAmount * 0.15) // يتطلب موافقة إذا كان الخصم أكثر من 15%
      }));
    } else {
      setFormData(prev => ({ ...prev, discountAmount: value }));
    }
  };

  const handleDiscountPercentageChange = (value: string) => {
    const percentage = Number(value);
    const originalAmount = Number(formData.originalAmount);
    
    if (originalAmount > 0) {
      const discountAmount = ((originalAmount * percentage) / 100).toFixed(0);
      setFormData(prev => ({
        ...prev,
        discountPercentage: value,
        discountAmount: discountAmount,
        requiresHigherApproval: percentage > 15 // يتطلب موافقة إذا كان الخصم أكثر من 15%
      }));
    } else {
      setFormData(prev => ({ ...prev, discountPercentage: value }));
    }
  };

  const calculateFinalAmount = () => {
    const original = Number(formData.originalAmount) || 0;
    const discount = Number(formData.discountAmount) || 0;
    return original - discount;
  };

  const handleSave = () => {
    if (!formData.contractId || !formData.discountAmount || !formData.discountType || !formData.discountReason) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (Number(formData.discountAmount) > Number(formData.originalAmount)) {
      toast({
        title: "خطأ في المبلغ",
        description: "مبلغ الخصم لا يمكن أن يكون أكبر من المبلغ الأصلي",
        variant: "destructive"
      });
      return;
    }

    // في التطبيق الحقيقي سيتم حفظ البيانات في قاعدة البيانات
    const message = formData.requiresHigherApproval 
      ? `تم إنشاء سند الخصم رقم ${generateVoucherNumber()} وأرسل للموافقة الإدارية`
      : `تم إنشاء سند الخصم رقم ${generateVoucherNumber()} بنجاح`;

    toast({
      title: "تم إنشاء سند الخصم",
      description: message,
      variant: "default"
    });

    setOpen(false);
    // Reset form
    setFormData({
      contractId: "",
      customerId: "",
      customerName: "",
      originalAmount: "",
      discountAmount: "",
      discountPercentage: "",
      discountType: "",
      discountReason: "",
      requiresHigherApproval: false,
      notes: ""
    });
  };

  const getDiscountTypeLabel = (type: string) => {
    const types = {
      'early_payment': 'خصم دفع مبكر',
      'long_term_rental': 'خصم إيجار طويل المدى',
      'loyalty_customer': 'خصم عميل مميز',
      'promotional': 'خصم ترويجي',
      'compensation': 'خصم تعويضي',
      'other': 'أخرى'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Percent className="h-4 w-4" />
          إنشاء سند خصم
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            إنشاء سند خصم جديد
          </DialogTitle>
          <DialogDescription>
            إصدار سند خصم للعملاء مع نظام الموافقات
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
                          {contract.contractNumber} - {contract.customerName} ({formatCurrency(contract.totalAmount)})
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
                      <span className="text-sm text-muted-foreground">المبلغ الأصلي:</span>
                      <span className="text-sm font-medium">{formatCurrency(Number(formData.originalAmount))}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discount Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  تفاصيل الخصم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountAmount">مبلغ الخصم (ريال)</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => handleDiscountAmountChange(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountPercentage">نسبة الخصم (%)</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                      placeholder="0.00"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="discountType">نوع الخصم</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الخصم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early_payment">خصم دفع مبكر</SelectItem>
                      <SelectItem value="long_term_rental">خصم إيجار طويل المدى</SelectItem>
                      <SelectItem value="loyalty_customer">خصم عميل مميز</SelectItem>
                      <SelectItem value="promotional">خصم ترويجي</SelectItem>
                      <SelectItem value="compensation">خصم تعويضي</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discountReason">سبب الخصم</Label>
                  <Input
                    id="discountReason"
                    value={formData.discountReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountReason: e.target.value }))}
                    placeholder="أدخل سبب الخصم"
                  />
                </div>

                {/* Final Amount Display */}
                {formData.originalAmount && formData.discountAmount && (
                  <div className="p-3 border rounded-lg bg-muted/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">المبلغ النهائي:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(calculateFinalAmount())}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Alert */}
            {formData.requiresHigherApproval && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  هذا الخصم يتطلب موافقة إدارية عليا لأنه يتجاوز الحد المسموح (15%)
                </AlertDescription>
              </Alert>
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
                <CardTitle className="text-center">معاينة سند الخصم</CardTitle>
                <CardDescription className="text-center">
                  رقم السند: {generateVoucherNumber()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Header */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-lg font-bold">سند خصم</h3>
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
                      <span className="text-sm text-muted-foreground">المبلغ الأصلي:</span>
                      <span className="text-sm font-medium">{formatCurrency(Number(formData.originalAmount))}</span>
                    </div>
                  </div>
                )}

                {/* Discount Details */}
                <div className="border rounded-lg p-3 bg-muted/20">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">مبلغ الخصم:</span>
                      <span className="text-lg font-bold text-destructive">
                        {formData.discountAmount ? formatCurrency(Number(formData.discountAmount)) : "0 ريال"}
                      </span>
                    </div>
                    {formData.discountPercentage && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">نسبة الخصم:</span>
                        <Badge variant="outline">
                          {Number(formData.discountPercentage).toFixed(1)}%
                        </Badge>
                      </div>
                    )}
                    {formData.discountType && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">نوع الخصم:</span>
                        <Badge variant="secondary">
                          {getDiscountTypeLabel(formData.discountType)}
                        </Badge>
                      </div>
                    )}
                    {formData.originalAmount && formData.discountAmount && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">المبلغ النهائي:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(calculateFinalAmount())}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Status */}
                {formData.requiresHigherApproval ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">يتطلب موافقة إدارية</p>
                      <p className="text-xs text-orange-600">سيتم إرسال السند للموافقة</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">جاهز للتطبيق</p>
                      <p className="text-xs text-green-600">لا يحتاج موافقة إضافية</p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                {formData.discountReason && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">سبب الخصم:</p>
                    <p className="text-sm font-medium">{formData.discountReason}</p>
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
                  <p className="text-xs text-muted-foreground">توقيع المحاسب: _______________</p>
                  {formData.requiresHigherApproval && (
                    <p className="text-xs text-muted-foreground">توقيع المدير: _______________</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    هذا السند يؤكد منح الخصم المذكور أعلاه
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
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {formData.requiresHigherApproval ? "حفظ وإرسال للموافقة" : "حفظ وإصدار السند"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}