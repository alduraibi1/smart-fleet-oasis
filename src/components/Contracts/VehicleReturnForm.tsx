
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface VehicleCondition {
  exterior: 'excellent' | 'good' | 'fair' | 'damaged';
  interior: 'excellent' | 'good' | 'fair' | 'damaged';
  tires: 'excellent' | 'good' | 'fair' | 'damaged';
  engine: 'excellent' | 'good' | 'fair' | 'damaged';
}

interface Contract {
  id: string;
  contract_number: string;
  customer?: { name: string };
  vehicle?: { brand: string; model: string; year: number; plate_number: string };
  start_date: string;
  end_date: string;
  daily_rate: number;
  mileage_start?: number;
}

interface Props {
  contract: Contract;
  onReturn: (returnData: any) => Promise<void>;
  onCancel: () => void;
}

const conditionOptions = {
  excellent: { label: 'ممتاز', color: 'bg-green-100 text-green-800' },
  good: { label: 'جيد', color: 'bg-blue-100 text-blue-800' },
  fair: { label: 'مقبول', color: 'bg-yellow-100 text-yellow-800' },
  damaged: { label: 'تالف', color: 'bg-red-100 text-red-800' },
};

export const VehicleReturnForm = ({ contract, onReturn, onCancel }: Props) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnTime, setReturnTime] = useState(new Date().toTimeString().slice(0, 5));
  const [currentMileage, setCurrentMileage] = useState(contract.mileage_start || 0);
  const [fuelLevel, setFuelLevel] = useState(100);
  const [condition, setCondition] = useState<VehicleCondition>({
    exterior: 'excellent',
    interior: 'excellent',
    tires: 'excellent',
    engine: 'excellent',
  });
  const [damageNotes, setDamageNotes] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState({
    lateFee: 0,
    fuelCharge: 0,
    damageFee: 0,
    cleaningFee: 0,
    other: 0,
    otherDescription: '',
  });
  const [returnNotes, setReturnNotes] = useState('');
  const [customerSignature, setCustomerSignature] = useState(false);
  const [inspectorName, setInspectorName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const calculateTotalCharges = () => {
    const { lateFee, fuelCharge, damageFee, cleaningFee, other } = additionalCharges;
    return lateFee + fuelCharge + damageFee + cleaningFee + other;
  };

  const isLateReturn = () => {
    const returnDateTime = new Date(`${returnDate}T${returnTime}`);
    const contractEndDate = new Date(contract.end_date);
    return returnDateTime > contractEndDate;
  };

  const getDaysLate = () => {
    if (!isLateReturn()) return 0;
    const returnDateTime = new Date(`${returnDate}T${returnTime}`);
    const contractEndDate = new Date(contract.end_date);
    const diffTime = returnDateTime.getTime() - contractEndDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateLateFee = () => {
    const daysLate = getDaysLate();
    return daysLate * contract.daily_rate * 1.5; // 1.5x daily rate as penalty
  };

  const handleSubmit = async () => {
    if (!inspectorName.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال اسم المفتش",
      });
      return;
    }

    if (!customerSignature) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى تأكيد موافقة العميل والتوقيع",
      });
      return;
    }

    setLoading(true);
    try {
      const totalCharges = calculateTotalCharges();
      const lateFeeCalculated = calculateLateFee();
      
      const returnData = {
        actual_return_date: `${returnDate}T${returnTime}:00`,
        mileage_end: currentMileage,
        fuel_level_end: fuelLevel.toString(),
        additional_charges: totalCharges + lateFeeCalculated,
        notes: `${returnNotes}\n\nفحص المركبة:\n${Object.entries(condition).map(([part, cond]) => `${part}: ${cond}`).join('\n')}\n\nالمفتش: ${inspectorName}\n\nالأضرار: ${damageNotes}`,
        status: 'completed'
      };

      await onReturn(returnData);
      toast({
        title: "تم بنجاح",
        description: "تم إرجاع المركبة وإنهاء العقد بنجاح",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إرجاع المركبة",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات العقد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>رقم العقد:</strong> {contract.contract_number}</p>
              <p><strong>العميل:</strong> {contract.customer?.name}</p>
              <p><strong>المركبة:</strong> {contract.vehicle?.brand} {contract.vehicle?.model} {contract.vehicle?.year}</p>
            </div>
            <div>
              <p><strong>اللوحة:</strong> {contract.vehicle?.plate_number}</p>
              <p><strong>تاريخ البداية:</strong> {contract.start_date}</p>
              <p><strong>تاريخ النهاية:</strong> {contract.end_date}</p>
            </div>
          </div>
          {isLateReturn() && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">إرجاع متأخر - {getDaysLate()} يوم</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                رسوم التأخير: {calculateLateFee().toLocaleString()} ريال
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الإرجاع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="returnDate">تاريخ الإرجاع</Label>
              <Input
                id="returnDate"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="returnTime">وقت الإرجاع</Label>
              <Input
                id="returnTime"
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentMileage">قراءة العداد الحالية</Label>
              <Input
                id="currentMileage"
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="fuelLevel">مستوى الوقود (%)</Label>
              <Input
                id="fuelLevel"
                type="number"
                min="0"
                max="100"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="inspectorName">اسم المفتش *</Label>
            <Input
              id="inspectorName"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="اسم الموظف المسؤول عن الفحص"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Inspection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            فحص حالة المركبة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(condition).map(([part, cond]) => (
              <div key={part}>
                <Label>
                  {part === 'exterior' && 'الخارج'}
                  {part === 'interior' && 'الداخل'}
                  {part === 'tires' && 'الإطارات'}
                  {part === 'engine' && 'المحرك'}
                </Label>
                <Select 
                  value={cond} 
                  onValueChange={(value: 'excellent' | 'good' | 'fair' | 'damaged') => 
                    setCondition(prev => ({ ...prev, [part]: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(conditionOptions).map(([key, option]) => (
                      <SelectItem key={key} value={key}>
                        <Badge className={option.color}>{option.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="damageNotes">ملاحظات الأضرار</Label>
            <Textarea
              id="damageNotes"
              placeholder="اذكر أي أضرار أو ملاحظات على حالة المركبة..."
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            الرسوم الإضافية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuelCharge">رسوم الوقود (ر.س)</Label>
              <Input
                id="fuelCharge"
                type="number"
                value={additionalCharges.fuelCharge}
                onChange={(e) => setAdditionalCharges(prev => ({ 
                  ...prev, 
                  fuelCharge: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="damageFee">رسوم الأضرار (ر.س)</Label>
              <Input
                id="damageFee"
                type="number"
                value={additionalCharges.damageFee}
                onChange={(e) => setAdditionalCharges(prev => ({ 
                  ...prev, 
                  damageFee: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="cleaningFee">رسوم التنظيف (ر.س)</Label>
              <Input
                id="cleaningFee"
                type="number"
                value={additionalCharges.cleaningFee}
                onChange={(e) => setAdditionalCharges(prev => ({ 
                  ...prev, 
                  cleaningFee: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="other">رسوم أخرى (ر.س)</Label>
              <Input
                id="other"
                type="number"
                value={additionalCharges.other}
                onChange={(e) => setAdditionalCharges(prev => ({ 
                  ...prev, 
                  other: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
          </div>

          {additionalCharges.other > 0 && (
            <div>
              <Label htmlFor="otherDescription">وصف الرسوم الأخرى</Label>
              <Input
                id="otherDescription"
                value={additionalCharges.otherDescription}
                onChange={(e) => setAdditionalCharges(prev => ({ 
                  ...prev, 
                  otherDescription: e.target.value 
                }))}
                placeholder="وصف الرسوم الأخرى"
              />
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span>إجمالي الرسوم الإضافية:</span>
              <span className="font-bold text-lg">
                {(calculateTotalCharges() + calculateLateFee()).toLocaleString()} ر.س
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Notes */}
      <Card>
        <CardHeader>
          <CardTitle>ملاحظات الإرجاع</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="أي ملاحظات إضافية حول عملية الإرجاع..."
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle>تأكيد الإرجاع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="signature"
              checked={customerSignature}
              onCheckedChange={(checked) => setCustomerSignature(checked as boolean)}
            />
            <Label htmlFor="signature" className="text-sm">
              أؤكد أن العميل قد راجع ووافق على تقرير الإرجاع والحساب النهائي *
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "جاري الإرجاع..." : "إنهاء الإرجاع"}
        </Button>
      </div>
    </div>
  );
};
