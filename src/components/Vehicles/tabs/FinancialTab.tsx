
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Vehicle } from '@/types/vehicle';

interface FinancialTabProps {
  vehicle: Vehicle;
}

export default function FinancialTab({ vehicle }: FinancialTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              معلومات الشراء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">سعر الشراء</Label>
              <p className="text-2xl font-bold text-primary">₪{vehicle.purchase?.purchasePrice?.toLocaleString() || 'غير محدد'}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                تاريخ الشراء
              </Label>
              <p className="font-medium">
                {vehicle.purchase?.purchaseDate ? new Date(vehicle.purchase.purchaseDate).toLocaleDateString('ar') : 'غير محدد'}
              </p>
            </div>

            {vehicle.purchase?.financingCompany && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  شركة التمويل
                </Label>
                <p className="font-medium">{vehicle.purchase.financingCompany}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              معلومات الإهلاك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehicle.purchase?.purchasePrice ? (
              <>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">القيمة الحالية</Label>
                  <p className="text-2xl font-bold text-green-600">
                    ₪{Math.round(vehicle.purchase.purchasePrice * 0.7).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">معدل الإهلاك السنوي</Label>
                  <p className="font-medium">15%</p>
                </div>

                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">إجمالي الإهلاك</Label>
                  <p className="font-medium text-red-600">
                    ₪{Math.round(vehicle.purchase.purchasePrice * 0.3).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                لم يتم تحديد معلومات الإهلاك بعد
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ملخص الإيرادات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الإيراد اليومي</p>
              <p className="text-2xl font-bold text-primary">₪{vehicle.daily_rate}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الإيراد الشهري المتوقع</p>
              <p className="text-2xl font-bold text-green-600">₪{(vehicle.daily_rate * 30).toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">الإيراد السنوي المتوقع</p>
              <p className="text-2xl font-bold text-blue-600">₪{(vehicle.daily_rate * 365).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
