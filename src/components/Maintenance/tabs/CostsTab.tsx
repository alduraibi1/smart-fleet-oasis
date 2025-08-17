
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calculator, DollarSign, Clock, Package, Droplets, Wrench, Percent, Gift } from "lucide-react";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface CostsTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData) => void;
  onCalculateCosts: () => void;
}

export function CostsTab({ formData, setFormData, onCalculateCosts }: CostsTabProps) {
  const handleLaborHoursChange = (value: number) => {
    setFormData({ ...formData, laborHours: value });
    setTimeout(onCalculateCosts, 100);
  };

  const handleHourlyRateChange = (value: number) => {
    setFormData({ ...formData, hourlyRate: value });
    setTimeout(onCalculateCosts, 100);
  };

  const handleAdditionalCostsChange = (value: number) => {
    setFormData({ ...formData, additionalCosts: value });
    setTimeout(onCalculateCosts, 100);
  };

  const handleDiscountChange = (value: number) => {
    setFormData({ ...formData, discount: value });
    setTimeout(onCalculateCosts, 100);
  };

  const handleWarrantyChange = (enabled: boolean) => {
    setFormData({ ...formData, warranty: enabled });
  };

  const handleWarrantyPeriodChange = (days: number) => {
    setFormData({ ...formData, warrantyPeriod: days });
  };

  const subtotal = formData.laborCost + formData.partsCost + formData.oilsCost + formData.additionalCosts;
  const discountAmount = formData.discount;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="space-y-6">
      {/* ملخص التكاليف */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            ملخص التكاليف
          </CardTitle>
          <CardDescription>
            حساب إجمالي تكاليف الصيانة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm text-muted-foreground">قطع الغيار</div>
              <div className="font-bold text-lg">{formData.partsCost.toFixed(2)} ر.س</div>
              <div className="text-xs text-muted-foreground">{formData.partsUsed.length} قطعة</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Droplets className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="text-sm text-muted-foreground">الزيوت</div>
              <div className="font-bold text-lg">{formData.oilsCost.toFixed(2)} ر.س</div>
              <div className="text-xs text-muted-foreground">{formData.oilsUsed.length} نوع</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm text-muted-foreground">العمالة</div>
              <div className="font-bold text-lg">{formData.laborCost.toFixed(2)} ر.س</div>
              <div className="text-xs text-muted-foreground">{formData.laborHours} ساعة</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm text-muted-foreground">إضافية</div>
              <div className="font-bold text-lg">{formData.additionalCosts.toFixed(2)} ر.س</div>
              <div className="text-xs text-muted-foreground">تكاليف أخرى</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">المجموع الفرعي:</span>
              <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
            </div>
            
            {formData.discount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  الخصم:
                </span>
                <span className="font-medium">-{discountAmount.toFixed(2)} ر.س</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>الإجمالي النهائي:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {finalTotal.toFixed(2)} ر.س
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل العمالة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            تكاليف العمالة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="laborHours">ساعات العمل</Label>
              <Input
                id="laborHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.laborHours}
                onChange={(e) => handleLaborHoursChange(parseFloat(e.target.value) || 0)}
                placeholder="عدد ساعات العمل"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">السعر بالساعة (ر.س)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => handleHourlyRateChange(parseFloat(e.target.value) || 0)}
                placeholder="السعر بالساعة"
              />
            </div>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">تكلفة العمالة الإجمالية:</span>
              <span className="font-medium">{formData.laborCost.toFixed(2)} ر.س</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التكاليف الإضافية والخصومات */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            تكاليف إضافية وخصومات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="additionalCosts">تكاليف إضافية (ر.س)</Label>
              <Input
                id="additionalCosts"
                type="number"
                min="0"
                value={formData.additionalCosts}
                onChange={(e) => handleAdditionalCostsChange(parseFloat(e.target.value) || 0)}
                placeholder="تكاليف إضافية (نقل، مواد استهلاكية، إلخ)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount">الخصم (ر.س)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={formData.discount}
                onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                placeholder="قيمة الخصم"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الضمان */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge className="h-4 w-4" />
            إعدادات الضمان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="warranty">تفعيل الضمان</Label>
              <p className="text-sm text-muted-foreground">
                هل تريد تقديم ضمان على هذه الصيانة؟
              </p>
            </div>
            <Switch
              id="warranty"
              checked={formData.warranty}
              onCheckedChange={handleWarrantyChange}
            />
          </div>
          
          {formData.warranty && (
            <div className="space-y-2">
              <Label htmlFor="warrantyPeriod">فترة الضمان (أيام)</Label>
              <Input
                id="warrantyPeriod"
                type="number"
                min="1"
                value={formData.warrantyPeriod}
                onChange={(e) => handleWarrantyPeriodChange(parseInt(e.target.value) || 30)}
                placeholder="عدد أيام الضمان"
              />
              <p className="text-xs text-muted-foreground">
                سينتهي الضمان في: {new Date(Date.now() + formData.warrantyPeriod * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
