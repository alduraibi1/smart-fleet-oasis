
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Printer, Calendar, DollarSign, Car, User } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';

interface DetailedReturnReportProps {
  contractId: string;
}

export default function DetailedReturnReport({ contractId }: DetailedReturnReportProps) {
  const { contracts } = useContracts();
  const [open, setOpen] = useState(false);
  
  const contract = contracts.find(c => c.id === contractId);
  
  if (!contract || contract.status !== 'completed') {
    return null;
  }

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportReport = () => {
    // تصدير التقرير كـ PDF أو Excel
    console.log('Exporting report for contract:', contractId);
  };

  const parseReturnNotes = (notes: string) => {
    const sections = notes.split('\n\n');
    const result = {
      generalNotes: '',
      vehicleCondition: {} as Record<string, string>,
      inspector: '',
      damages: '',
    };

    sections.forEach(section => {
      if (section.includes('فحص المركبة:')) {
        const conditionLines = section.split('\n').slice(1);
        conditionLines.forEach(line => {
          const [part, condition] = line.split(': ');
          if (part && condition) {
            result.vehicleCondition[part] = condition;
          }
        });
      } else if (section.includes('المفتش:')) {
        result.inspector = section.replace('المفتش: ', '');
      } else if (section.includes('الأضرار:')) {
        result.damages = section.replace('الأضرار: ', '');
      } else if (!section.includes(':')) {
        result.generalNotes = section;
      }
    });

    return result;
  };

  const returnData = contract.notes ? parseReturnNotes(contract.notes) : null;
  const returnDate = contract.actual_return_date ? new Date(contract.actual_return_date) : null;
  const contractEndDate = new Date(contract.end_date);
  const isLateReturn = returnDate && returnDate > contractEndDate;
  const daysLate = isLateReturn ? Math.ceil((returnDate.getTime() - contractEndDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 ml-1" />
          تقرير مفصل
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تقرير إرجاع المركبة المفصل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات العقد الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات العقد
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">رقم العقد:</span>
                <p className="text-muted-foreground">{contract.id.slice(0, 8)}</p>
              </div>
              <div>
                <span className="font-medium">العميل:</span>
                <p className="text-muted-foreground">{contract.customer?.name}</p>
              </div>
              <div>
                <span className="font-medium">تاريخ البداية:</span>
                <p className="text-muted-foreground">{new Date(contract.start_date).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <span className="font-medium">تاريخ النهاية المقرر:</span>
                <p className="text-muted-foreground">{contractEndDate.toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <span className="font-medium">تاريخ الإرجاع الفعلي:</span>
                <p className="text-muted-foreground">
                  {returnDate?.toLocaleDateString('ar-SA')} - {returnDate?.toLocaleTimeString('ar-SA')}
                  {isLateReturn && (
                    <Badge variant="destructive" className="mr-2">
                      متأخر {daysLate} يوم
                    </Badge>
                  )}
                </p>
              </div>
              <div>
                <span className="font-medium">المدة الفعلية:</span>
                <p className="text-muted-foreground">
                  {Math.ceil((returnDate?.getTime() || Date.now() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24))} يوم
                </p>
              </div>
            </CardContent>
          </Card>

          {/* معلومات المركبة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                معلومات المركبة
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">المركبة:</span>
                <p className="text-muted-foreground">
                  {contract.vehicle?.brand} {contract.vehicle?.model} {contract.vehicle?.year}
                </p>
              </div>
              <div>
                <span className="font-medium">رقم اللوحة:</span>
                <p className="text-muted-foreground">{contract.vehicle?.plate_number}</p>
              </div>
              <div>
                <span className="font-medium">الكيلومترات عند البداية:</span>
                <p className="text-muted-foreground">{contract.mileage_start?.toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium">الكيلومترات عند الإرجاع:</span>
                <p className="text-muted-foreground">{contract.mileage_end?.toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium">المسافة المقطوعة:</span>
                <p className="text-muted-foreground">
                  {((contract.mileage_end || 0) - (contract.mileage_start || 0)).toLocaleString()} كم
                </p>
              </div>
              <div>
                <span className="font-medium">مستوى الوقود:</span>
                <p className="text-muted-foreground">{contract.fuel_level_end}%</p>
              </div>
            </CardContent>
          </Card>

          {/* حالة المركبة عند الإرجاع */}
          {returnData?.vehicleCondition && Object.keys(returnData.vehicleCondition).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>حالة المركبة عند الإرجاع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(returnData.vehicleCondition).map(([part, condition]) => (
                    <div key={part} className="flex justify-between items-center">
                      <span className="font-medium">{part}:</span>
                      <Badge 
                        variant={condition === 'excellent' ? 'default' : 
                               condition === 'good' ? 'secondary' : 
                               condition === 'fair' ? 'outline' : 'destructive'}
                      >
                        {condition}
                      </Badge>
                    </div>
                  ))}
                </div>
                {returnData.damages && (
                  <div className="mt-4">
                    <span className="font-medium">ملاحظات الأضرار:</span>
                    <p className="text-muted-foreground mt-1">{returnData.damages}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* المعلومات المالية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                المعلومات المالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">السعر اليومي:</span>
                  <p className="text-muted-foreground">{contract.daily_rate.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <span className="font-medium">المبلغ الأساسي:</span>
                  <p className="text-muted-foreground">{contract.total_amount.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <span className="font-medium">الرسوم الإضافية:</span>
                  <p className="text-muted-foreground">{(contract.additional_charges || 0).toLocaleString()} ر.س</p>
                </div>
                <div>
                  <span className="font-medium">المبلغ النهائي:</span>
                  <p className="text-lg font-bold text-primary">
                    {(contract.total_amount + (contract.additional_charges || 0)).toLocaleString()} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {returnData?.inspector && (
                <div>
                  <span className="font-medium">المفتش:</span>
                  <p className="text-muted-foreground">{returnData.inspector}</p>
                </div>
              )}
              {returnData?.generalNotes && (
                <div>
                  <span className="font-medium">ملاحظات عامة:</span>
                  <p className="text-muted-foreground">{returnData.generalNotes}</p>
                </div>
              )}
              <div>
                <span className="font-medium">تاريخ إنشاء التقرير:</span>
                <p className="text-muted-foreground">{new Date().toLocaleDateString('ar-SA')}</p>
              </div>
            </CardContent>
          </Card>

          {/* أزرار الإجراءات */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handlePrintReport}>
              <Printer className="h-4 w-4 ml-1" />
              طباعة
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 ml-1" />
              تصدير PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
