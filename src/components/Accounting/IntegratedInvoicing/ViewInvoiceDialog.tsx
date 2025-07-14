import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, Mail, Printer, Edit } from "lucide-react";

interface ViewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

export function ViewInvoiceDialog({ open, onOpenChange, invoice }: ViewInvoiceDialogProps) {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'paid': 'default',
      'partial': 'secondary', 
      'pending': 'outline',
      'overdue': 'destructive',
      'cancelled': 'secondary'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status === 'paid' ? 'مدفوعة' : 
         status === 'partial' ? 'مدفوعة جزئياً' :
         status === 'pending' ? 'معلقة' :
         status === 'overdue' ? 'متأخرة' : 'ملغاة'}
      </Badge>
    );
  };

  // Mock line items for demonstration
  const lineItems = [
    {
      description: "إيجار شهري - مركبة " + (invoice.plateNumber || ""),
      quantity: 1,
      unitPrice: invoice.totalAmount * 0.87, // Before VAT
      vatRate: 15,
      total: invoice.totalAmount
    }
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const vatAmount = lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.vatRate / 100), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>تفاصيل الفاتورة - {invoice.invoiceNumber}</DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(invoice.status)}
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">بيانات الفاتورة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الفاتورة:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="font-medium">
                    {invoice.invoiceType === 'rental' ? 'فاتورة إيجار' :
                     invoice.invoiceType === 'maintenance' ? 'فاتورة صيانة' :
                     invoice.invoiceType === 'purchase' ? 'فاتورة مشتريات' : 'رسوم إضافية'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الإصدار:</span>
                  <span className="font-medium">{invoice.invoiceDate.toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الاستحقاق:</span>
                  <span className="font-medium">{invoice.dueDate.toLocaleDateString('ar-SA')}</span>
                </div>
                {invoice.plateNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم المركبة:</span>
                    <span className="font-medium">{invoice.plateNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">بيانات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الاسم:</span>
                  <span className="font-medium">{invoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الهاتف:</span>
                  <span className="font-medium">0501234567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">البريد الإلكتروني:</span>
                  <span className="font-medium">customer@example.com</span>
                </div>
                {invoice.contractId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم العقد:</span>
                    <span className="font-medium">{invoice.contractId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>بنود الفاتورة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>ضريبة القيمة المضافة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{item.vatRate}%</TableCell>
                      <TableCell>{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص المبالغ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md ml-auto">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة:</span>
                  <span>{formatCurrency(vatAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع الإجمالي:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>المبلغ المدفوع:</span>
                  <span>{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>المبلغ المتبقي:</span>
                  <span>{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.paidAmount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>سجل المدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead>رقم المرجع</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{invoice.invoiceDate.toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                      <TableCell>تحويل بنكي</TableCell>
                      <TableCell>TXN-2024-001</TableCell>
                      <TableCell>
                        <Badge variant="default">مؤكد</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            {invoice.status === 'pending' && (
              <Button>
                تسجيل دفعة
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}