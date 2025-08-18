import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Package, 
  Droplets,
  Receipt,
  Percent,
  Shield
} from "lucide-react";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface CostsTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData | ((prev: MaintenanceFormData) => MaintenanceFormData)) => void;
  onCalculateCosts: () => void;
}

export function CostsTab({ formData, setFormData, onCalculateCosts }: CostsTabProps) {
  const handleInputChange = (field: keyof MaintenanceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTimeout(onCalculateCosts, 0);
  };

  const subtotal = formData.laborCost + formData.partsCost + formData.oilsCost + formData.additionalCosts;
  const finalTotal = Math.max(0, subtotal - formData.discount);
  const profitMargin = ((finalTotal - (formData.partsCost + formData.oilsCost)) / finalTotal * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Labor Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            تكاليف العمالة
          </CardTitle>
          <CardDescription>
            حساب تكلفة العمالة والوقت المستغرق
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>ساعات العمل الفعلية</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={formData.laborHours || ""}
                onChange={(e) => handleInputChange("laborHours", parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>أجرة الساعة (ر.س)</Label>
              <Input
                type="number"
                min="0"
                placeholder="50"
                value={formData.hourlyRate || ""}
                onChange={(e) => handleInputChange("hourlyRate", parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>إجمالي تكلفة العمالة</Label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                <span className="font-medium text-lg">{formData.laborCost.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {formData.estimatedHours > 0 && formData.laborHours > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                الوقت المقدر: {formData.estimatedHours} ساعة | 
                الوقت الفعلي: {formData.laborHours} ساعة
                {formData.laborHours > formData.estimatedHours && (
                  <Badge variant="secondary" className="mr-2">
                    تجاوز بـ {(formData.laborHours - formData.estimatedHours).toFixed(1)} ساعة
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parts & Oils Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              تكلفة قطع الغيار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>عدد القطع المستخدمة:</span>
                <Badge variant="secondary">{formData.partsUsed.length} قطعة</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>إجمالي الكمية:</span>
                <span>{formData.partsUsed.reduce((sum, part) => sum + part.quantity, 0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>الإجمالي:</span>
                <span>{formData.partsCost.toFixed(2)} ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              تكلفة الزيوت والسوائل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>عدد الأنواع المستخدمة:</span>
                <Badge variant="secondary">{formData.oilsUsed.length} نوع</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>إجمالي الكمية:</span>
                <span>{formData.oilsUsed.reduce((sum, oil) => sum + oil.quantity, 0)} لتر</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>الإجمالي:</span>
                <span>{formData.oilsCost.toFixed(2)} ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            تكاليف إضافية وخصومات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تكاليف إضافية (ر.س)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData.additionalCosts || ""}
                onChange={(e) => handleInputChange("additionalCosts", parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>خصم (ر.س)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData.discount || ""}
                onChange={(e) => handleInputChange("discount", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <Label>وصف التكاليف الإضافية</Label>
            <Textarea
              placeholder="اكتب تفاصيل التكاليف الإضافية أو سبب الخصم..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Warranty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            الضمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="warranty"
                checked={formData.warranty}
                onCheckedChange={(checked) => handleInputChange("warranty", checked)}
              />
              <Label htmlFor="warranty">يشمل ضمان</Label>
            </div>
            
            {formData.warranty && (
              <div className="space-y-2">
                <Label>فترة الضمان (بالأيام)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.warrantyPeriod || ""}
                  onChange={(e) => handleInputChange("warrantyPeriod", parseInt(e.target.value) || 30)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ملخص التكاليف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>تكلفة العمالة:</span>
              <span>{formData.laborCost.toFixed(2)} ر.س</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>تكلفة قطع الغيار:</span>
              <span>{formData.partsCost.toFixed(2)} ر.س</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>تكلفة الزيوت والسوائل:</span>
              <span>{formData.oilsCost.toFixed(2)} ر.س</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>تكاليف إضافية:</span>
              <span>{formData.additionalCosts.toFixed(2)} ر.س</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span>المجموع الفرعي:</span>
              <span>{subtotal.toFixed(2)} ر.س</span>
            </div>
            
            {formData.discount > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span>الخصم:</span>
                <span>-{formData.discount.toFixed(2)} ر.س</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center text-xl font-bold">
              <span>الإجمالي النهائي:</span>
              <span className="text-primary">{finalTotal.toFixed(2)} ر.س</span>
            </div>
            
            {profitMargin > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">
                    هامش الربح المتوقع: {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}