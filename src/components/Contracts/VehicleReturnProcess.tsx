
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Car, 
  Camera, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Clock,
  Fuel,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';

interface VehicleReturnProcessProps {
  contract: {
    id: string;
    contract_number: string;
    customer?: { name: string; phone: string };
    vehicle?: { brand: string; model: string; plate_number: string };
    mileage_start?: number;
    fuel_level_start?: string;
    deposit_amount: number;
    total_amount: number;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export const VehicleReturnProcess: React.FC<VehicleReturnProcessProps> = ({
  contract,
  onComplete,
  onCancel
}) => {
  const [returnData, setReturnData] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    mileage_end: '',
    fuel_level_end: 'full',
    additional_charges: 0,
    damage_charges: 0,
    cleaning_charges: 0,
    late_return_charges: 0,
    fuel_charges: 0,
    notes: '',
    damage_description: '',
    images: [] as string[],
  });

  const [inspectionItems, setInspectionItems] = useState([
    { item: 'الإطارات والعجلات', checked: false, damage: false, notes: '' },
    { item: 'الأضواء الأمامية والخلفية', checked: false, damage: false, notes: '' },
    { item: 'المرايا الجانبية', checked: false, damage: false, notes: '' },
    { item: 'الزجاج الأمامي والخلفي', checked: false, damage: false, notes: '' },
    { item: 'الأبواب والمقابض', checked: false, damage: false, notes: '' },
    { item: 'المقاعد والتنجيد', checked: false, damage: false, notes: '' },
    { item: 'لوحة القيادة والأجهزة', checked: false, damage: false, notes: '' },
    { item: 'نظافة المركبة العامة', checked: false, damage: false, notes: '' },
  ]);

  const { completeContract } = useContracts();
  const { toast } = useToast();

  const calculateTotalCharges = () => {
    return returnData.damage_charges + 
           returnData.cleaning_charges + 
           returnData.late_return_charges + 
           returnData.fuel_charges;
  };

  const calculateRefund = () => {
    const totalCharges = calculateTotalCharges();
    return Math.max(0, contract.deposit_amount - totalCharges);
  };

  const handleInspectionChange = (index: number, field: string, value: any) => {
    setInspectionItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const totalCharges = calculateTotalCharges();
      const damages = inspectionItems.filter(item => item.damage);
      
      await completeContract(contract.id, {
        actual_return_date: returnData.actual_return_date,
        mileage_end: parseInt(returnData.mileage_end),
        fuel_level_end: returnData.fuel_level_end,
        additional_charges: totalCharges,
        notes: `
إرجاع المركبة:
${returnData.notes}

فحص المركبة:
${damages.length > 0 ? 
  `أضرار تم العثور عليها:\n${damages.map(d => `- ${d.item}: ${d.notes}`).join('\n')}` : 
  'لا توجد أضرار'
}

تفاصيل الرسوم:
- رسوم الأضرار: ${returnData.damage_charges} ر.س
- رسوم التنظيف: ${returnData.cleaning_charges} ر.س  
- رسوم التأخير: ${returnData.late_return_charges} ر.س
- رسوم الوقود: ${returnData.fuel_charges} ر.س
المجموع: ${totalCharges} ر.س
        `.trim()
      });

      toast({
        title: 'تم إرجاع المركبة بنجاح',
        description: `تم إكمال عملية الإرجاع للعقد ${contract.contract_number}`,
      });

      onComplete();
    } catch (error) {
      toast({
        title: 'خطأ في إرجاع المركبة',
        description: 'حدث خطأ أثناء عملية الإرجاع',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            معلومات العقد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">رقم العقد:</span>
              <div>{contract.contract_number}</div>
            </div>
            <div>
              <span className="font-medium">العميل:</span>
              <div>{contract.customer?.name}</div>
            </div>
            <div>
              <span className="font-medium">المركبة:</span>
              <div>{contract.vehicle?.brand} {contract.vehicle?.model}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            تفاصيل الإرجاع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="return_date">تاريخ الإرجاع</Label>
              <Input
                id="return_date"
                type="date"
                value={returnData.actual_return_date}
                onChange={(e) => setReturnData(prev => ({ ...prev, actual_return_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="mileage_end">قراءة العداد عند الإرجاع</Label>
              <Input
                id="mileage_end"
                type="number"
                placeholder="كم"
                value={returnData.mileage_end}
                onChange={(e) => setReturnData(prev => ({ ...prev, mileage_end: e.target.value }))}
              />
              {contract.mileage_start && returnData.mileage_end && (
                <div className="text-xs text-muted-foreground mt-1">
                  المسافة المقطوعة: {parseInt(returnData.mileage_end) - contract.mileage_start} كم
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="fuel_level">مستوى الوقود</Label>
              <Select 
                value={returnData.fuel_level_end} 
                onValueChange={(value) => setReturnData(prev => ({ ...prev, fuel_level_end: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">ممتلئ</SelectItem>
                  <SelectItem value="3/4">3/4</SelectItem>
                  <SelectItem value="1/2">نصف</SelectItem>
                  <SelectItem value="1/4">ربع</SelectItem>
                  <SelectItem value="empty">فارغ</SelectItem>
                </SelectContent>
              </Select>
              {contract.fuel_level_start !== returnData.fuel_level_end && (
                <div className="text-xs text-orange-600 mt-1">
                  <Fuel className="h-3 w-3 inline mr-1" />
                  مستوى الوقود مختلف عن البداية ({contract.fuel_level_start})
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Inspection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            فحص المركبة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inspectionItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    id={`inspection_${index}`}
                    checked={item.checked}
                    onCheckedChange={(checked) => 
                      handleInspectionChange(index, 'checked', checked)
                    }
                  />
                  <Label htmlFor={`inspection_${index}`} className="flex-1">
                    {item.item}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`damage_${index}`}
                    checked={item.damage}
                    onCheckedChange={(checked) => 
                      handleInspectionChange(index, 'damage', checked)
                    }
                  />
                  <Label htmlFor={`damage_${index}`} className="text-red-600">
                    ضرر
                  </Label>
                </div>

                {item.damage && (
                  <Input
                    placeholder="وصف الضرر..."
                    value={item.notes}
                    onChange={(e) => 
                      handleInspectionChange(index, 'notes', e.target.value)
                    }
                    className="w-48"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            الرسوم الإضافية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="damage_charges">رسوم الأضرار (ر.س)</Label>
              <Input
                id="damage_charges"
                type="number"
                step="0.01"
                value={returnData.damage_charges}
                onChange={(e) => setReturnData(prev => ({ 
                  ...prev, 
                  damage_charges: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="cleaning_charges">رسوم التنظيف (ر.س)</Label>
              <Input
                id="cleaning_charges"
                type="number"
                step="0.01"
                value={returnData.cleaning_charges}
                onChange={(e) => setReturnData(prev => ({ 
                  ...prev, 
                  cleaning_charges: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="late_charges">رسوم التأخير (ر.س)</Label>
              <Input
                id="late_charges"
                type="number"
                step="0.01"
                value={returnData.late_return_charges}
                onChange={(e) => setReturnData(prev => ({ 
                  ...prev, 
                  late_return_charges: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="fuel_charges">رسوم الوقود (ر.س)</Label>
              <Input
                id="fuel_charges"
                type="number"
                step="0.01"
                value={returnData.fuel_charges}
                onChange={(e) => setReturnData(prev => ({ 
                  ...prev, 
                  fuel_charges: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
          </div>

          <Separator />

          {/* Financial Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>الوديعة الأصلية:</span>
              <span>{contract.deposit_amount} ر.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>إجمالي الرسوم الإضافية:</span>
              <span>{calculateTotalCharges()} ر.س</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>المبلغ المسترد:</span>
              <span className={calculateRefund() > 0 ? 'text-green-600' : 'text-red-600'}>
                {calculateRefund()} ر.س
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ملاحظات الإرجاع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="أي ملاحظات إضافية حول عملية الإرجاع..."
            value={returnData.notes}
            onChange={(e) => setReturnData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          إكمال الإرجاع
        </Button>
      </div>
    </div>
  );
};
