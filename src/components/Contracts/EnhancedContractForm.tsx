
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, AlertCircle } from 'lucide-react';
import { FieldRequirement } from './ContractValidation';

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
      
      // Calculate VAT
      let vatAmount = 0;
      if (formData.vatEnabled && formData.vatRate) {
        vatAmount = (subtotal + (formData.additionalCharges || 0) + (formData.delegationFee || 0) - (formData.discount || 0)) * (formData.vatRate / 100);
      }
      
      const totalAmount = subtotal + (formData.additionalCharges || 0) + (formData.delegationFee || 0) + vatAmount - (formData.discount || 0);
      
      setFormData(prev => ({
        ...prev,
        totalDays: daysDiff,
        subtotal: subtotal,
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="flex items-center gap-1">
                تاريخ البداية
                <FieldRequirement required />
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
                تاريخ النهاية
                <FieldRequirement required />
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
                السعر اليومي (ر.س)
                <FieldRequirement required />
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

      {/* Deposit/Security Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            مبلغ التأمين
            <FieldRequirement required />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="depositAmount" className="flex items-center gap-1">
                مبلغ التأمين (ر.س)
                <FieldRequirement required />
              </Label>
              <Input
                id="depositAmount"
                type="number"
                min="0"
                value={formData.depositAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                className="border-red-200 focus:border-red-500"
                placeholder="أدخل مبلغ التأمين المطلوب"
              />
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                سيتم إنشاء فاتورة منفصلة لمبلغ التأمين من قبل قسم المحاسبة
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Charges and Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            الرسوم الإضافية والخصومات
            <FieldRequirement optional />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="delegationFee" className="flex items-center gap-1">
                رسوم التفويض (ر.س)
                <FieldRequirement optional />
              </Label>
              <Input
                id="delegationFee"
                type="number"
                min="0"
                value={formData.delegationFee || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, delegationFee: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="additionalCharges" className="flex items-center gap-1">
                رسوم إضافية (ر.س)
                <FieldRequirement optional />
              </Label>
              <Input
                id="additionalCharges"
                type="number"
                min="0"
                value={formData.additionalCharges || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalCharges: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="discount" className="flex items-center gap-1">
                خصم (ر.س)
                <FieldRequirement optional />
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={formData.discount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VAT Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            إعدادات ضريبة القيمة المضافة
            <FieldRequirement optional />
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

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ملاحظات
            <FieldRequirement optional />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="أدخل أي ملاحظات إضافية عن العقد..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            الملخص المالي للعقد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>مبلغ الإيجار الأساسي:</span>
              <span className="font-bold">{((formData.totalDays || 0) * (formData.dailyRate || 0)).toLocaleString()} ر.س</span>
            </div>
            
            {(formData.delegationFee || 0) > 0 && (
              <div className="flex justify-between">
                <span>رسوم التفويض:</span>
                <span className="font-bold">{(formData.delegationFee || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            {(formData.additionalCharges || 0) > 0 && (
              <div className="flex justify-between">
                <span>رسوم إضافية:</span>
                <span className="font-bold">{(formData.additionalCharges || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            {(formData.discount || 0) > 0 && (
              <div className="flex justify-between">
                <span>خصم:</span>
                <span className="font-bold text-green-600">-{(formData.discount || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            {formData.vatEnabled && (formData.vat || 0) > 0 && (
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة ({formData.vatRate || 15}%):</span>
                <span className="font-bold">{(formData.vat || 0).toLocaleString()} ر.س</span>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>إجمالي مبلغ الإيجار:</span>
                <span className="text-primary">{(formData.totalAmount || 0).toLocaleString()} ر.س</span>
              </div>
            </div>

            {/* Deposit Summary */}
            {(formData.depositAmount || 0) > 0 && (
              <div className="border-t pt-2 bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">مبلغ التأمين (منفصل):</span>
                  <span className="font-bold text-blue-600">{(formData.depositAmount || 0).toLocaleString()} ر.س</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  * سيتم إنشاء فاتورة منفصلة لمبلغ التأمين من قبل قسم المحاسبة
                </p>
              </div>
            )}
          </div>

          {(!formData.startDate || !formData.endDate || !formData.dailyRate || !formData.depositAmount) && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                يرجى إكمال الحقول الإلزامية: التواريخ، السعر اليومي، ومبلغ التأمين
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
