
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertCircle } from 'lucide-react';

interface EnhancedContractFormProps {
  formData: any;
  setFormData: (data: any) => void;
  selectedCustomer?: any;
  selectedVehicle?: any;
}

export const EnhancedContractForm = ({ 
  formData, 
  setFormData, 
  selectedCustomer, 
  selectedVehicle 
}: EnhancedContractFormProps) => {
  
  const calculateFinancials = () => {
    if (formData.startDate && formData.endDate && formData.dailyRate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      const subtotal = daysDiff * formData.dailyRate;
      
      // Calculate insurance
      let insuranceAmount = 0;
      if (formData.insuranceType === 'percentage' && formData.insurancePercentage) {
        insuranceAmount = subtotal * (formData.insurancePercentage / 100);
      } else if (formData.insuranceType === 'fixed' && formData.insuranceAmount) {
        insuranceAmount = formData.insuranceAmount;
      }
      
      // Calculate VAT
      let vatAmount = 0;
      if (formData.vatEnabled && formData.vatRate) {
        vatAmount = (subtotal + formData.additionalCharges + formData.delegationFee - formData.discount + insuranceAmount) * (formData.vatRate / 100);
      }
      
      const totalAmount = subtotal + formData.additionalCharges + formData.delegationFee + insuranceAmount + vatAmount - formData.discount;
      
      setFormData(prev => ({
        ...prev,
        totalDays: daysDiff,
        subtotal: subtotal,
        calculatedInsuranceAmount: insuranceAmount,
        vat: vatAmount,
        totalAmount: totalAmount,
      }));
    }
  };

  useEffect(() => {
    calculateFinancials();
  }, [
    formData.startDate, 
    formData.endDate, 
    formData.dailyRate, 
    formData.additionalCharges, 
    formData.discount, 
    formData.delegationFee, 
    formData.insuranceType,
    formData.insurancePercentage,
    formData.insuranceAmount,
    formData.vatEnabled,
    formData.vatRate
  ]);

  return (
    <div className="space-y-6">
      {/* Basic Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            المعلومات الأساسية
            <Badge variant="destructive" className="text-xs">إلزامي</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="flex items-center gap-1">
                تاريخ البداية <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="border-red-200 focus:border-red-500"
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="flex items-center gap-1">
                تاريخ النهاية <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="border-red-200 focus:border-red-500"
              />
            </div>

            <div>
              <Label htmlFor="dailyRate" className="flex items-center gap-1">
                السعر اليومي (ر.س) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dailyRate"
                type="number"
                value={formData.dailyRate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) || 0 }))}
                className="border-red-200 focus:border-red-500"
              />
            </div>

            <div>
              <Label htmlFor="totalDays">عدد الأيام</Label>
              <Input
                id="totalDays"
                type="number"
                value={formData.totalDays || 0}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            إعدادات التأمين
            <Badge variant="secondary" className="text-xs">اختياري</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="insuranceType">نوع التأمين</Label>
            <Select 
              value={formData.insuranceType || 'none'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, insuranceType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون تأمين</SelectItem>
                <SelectItem value="percentage">نسبة مئوية</SelectItem>
                <SelectItem value="fixed">مبلغ مقطوع</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.insuranceType === 'percentage' && (
            <div>
              <Label htmlFor="insurancePercentage">نسبة التأمين (%)</Label>
              <Input
                id="insurancePercentage"
                type="number"
                min="0"
                max="100"
                value={formData.insurancePercentage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insurancePercentage: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          )}

          {formData.insuranceType === 'fixed' && (
            <div>
              <Label htmlFor="insuranceAmount">مبلغ التأمين (ر.س)</Label>
              <Input
                id="insuranceAmount"
                type="number"
                min="0"
                value={formData.insuranceAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          )}

          {formData.insuranceType !== 'none' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                مبلغ التأمين المحسوب: {(formData.calculatedInsuranceAmount || 0).toLocaleString()} ر.س
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VAT Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            إعدادات ضريبة القيمة المضافة
            <Badge variant="secondary" className="text-xs">اختياري</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="vatEnabled"
              checked={formData.vatEnabled || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, vatEnabled: checked }))}
            />
            <Label htmlFor="vatEnabled">تطبيق ضريبة القيمة المضافة</Label>
          </div>

          {formData.vatEnabled && (
            <div>
              <Label htmlFor="vatRate">نسبة الضريبة (%)</Label>
              <Input
                id="vatRate"
                type="number"
                min="0"
                max="50"
                value={formData.vatRate || 15}
                onChange={(e) => setFormData(prev => ({ ...prev, vatRate: parseFloat(e.target.value) || 15 }))}
              />
            </div>
          )}

          {formData.vatEnabled && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                ضريبة القيمة المضافة: {(formData.vat || 0).toLocaleString()} ر.س
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            الملخص المالي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>مبلغ الإيجار الأساسي:</span>
              <span className="font-bold">{((formData.totalDays || 0) * (formData.dailyRate || 0)).toLocaleString()} ر.س</span>
            </div>
            
            {formData.delegationFee > 0 && (
              <div className="flex justify-between">
                <span>رسوم التفويض:</span>
                <span className="font-bold">{(formData.delegationFee || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            {formData.additionalCharges > 0 && (
              <div className="flex justify-between">
                <span>رسوم إضافية:</span>
                <span className="font-bold">{(formData.additionalCharges || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            {formData.discount > 0 && (
              <div className="flex justify-between">
                <span>خصم:</span>
                <span className="font-bold text-green-600">-{(formData.discount || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            {formData.insuranceType !== 'none' && formData.calculatedInsuranceAmount > 0 && (
              <div className="flex justify-between">
                <span>التأمين:</span>
                <span className="font-bold">{(formData.calculatedInsuranceAmount || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            {formData.vatEnabled && formData.vat > 0 && (
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة ({formData.vatRate || 15}%):</span>
                <span className="font-bold">{(formData.vat || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>المبلغ الإجمالي:</span>
                <span className="text-primary">{(formData.totalAmount || 0).toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          {(!formData.startDate || !formData.endDate || !formData.dailyRate) && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                يرجى إكمال الحقول الإلزامية لحساب المبلغ الإجمالي
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
