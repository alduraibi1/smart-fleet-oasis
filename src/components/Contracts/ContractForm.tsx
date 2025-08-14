
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ContractFormData {
  customer_id: string;
  vehicle_id: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  insurance_amount: number;
  pickup_location: string;
  return_location: string;
  mileage_start: number;
  fuel_level_start: string;
  payment_method: string;
  notes: string;
}

interface ContractFormProps {
  customers: any[];
  vehicles: any[];
  onSubmit: (data: ContractFormData) => void;
  loading: boolean;
}

export const ContractForm = ({ customers, vehicles, onSubmit, loading }: ContractFormProps) => {
  const [formData, setFormData] = useState<ContractFormData>({
    customer_id: '',
    vehicle_id: '',
    start_date: undefined,
    end_date: undefined,
    daily_rate: 0,
    total_amount: 0,
    deposit_amount: 0,
    insurance_amount: 0,
    pickup_location: '',
    return_location: '',
    mileage_start: 0,
    fuel_level_start: 'full',
    payment_method: 'cash',
    notes: ''
  });

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);

  const calculateTotalAmount = () => {
    if (formData.start_date && formData.end_date && formData.daily_rate) {
      const diffTime = Math.abs(formData.end_date.getTime() - formData.start_date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * formData.daily_rate;
    }
    return 0;
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicleId,
      daily_rate: vehicle?.daily_rate || 0,
      mileage_start: vehicle?.mileage || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = calculateTotalAmount();
    onSubmit({
      ...formData,
      total_amount: totalAmount + formData.insurance_amount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات العميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customer">اختر العميل</Label>
              <Select value={formData.customer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات المركبة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicle">اختر المركبة</Label>
              <Select value={formData.vehicle_id} onValueChange={handleVehicleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVehicle && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm"><strong>السعر اليومي:</strong> {selectedVehicle.daily_rate} ر.س</p>
                <p className="text-sm"><strong>الكيلومترات:</strong> {selectedVehicle.mileage?.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Dates */}
      <Card>
        <CardHeader>
          <CardTitle>تواريخ العقد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>تاريخ البداية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>تاريخ النهاية</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>التفاصيل المالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="daily_rate">السعر اليومي (ر.س)</Label>
              <Input
                id="daily_rate"
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="deposit_amount">مبلغ التأمين (ر.س)</Label>
              <Input
                id="deposit_amount"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="insurance_amount">رسوم التأمين (ر.س)</Label>
              <Input
                id="insurance_amount"
                type="number"
                value={formData.insurance_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, insurance_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-lg font-semibold">
              المبلغ الإجمالي: {(calculateTotalAmount() + formData.insurance_amount).toLocaleString()} ر.س
            </p>
            <p className="text-sm text-muted-foreground">
              {formData.start_date && formData.end_date && 
                `عدد الأيام: ${Math.ceil(Math.abs(formData.end_date.getTime() - formData.start_date.getTime()) / (1000 * 60 * 60 * 24))}`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل إضافية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickup_location">مكان الاستلام</Label>
              <Input
                id="pickup_location"
                value={formData.pickup_location}
                onChange={(e) => setFormData(prev => ({ ...prev, pickup_location: e.target.value }))}
                placeholder="مكان استلام المركبة"
              />
            </div>
            <div>
              <Label htmlFor="return_location">مكان الإرجاع</Label>
              <Input
                id="return_location"
                value={formData.return_location}
                onChange={(e) => setFormData(prev => ({ ...prev, return_location: e.target.value }))}
                placeholder="مكان إرجاع المركبة"
              />
            </div>
            <div>
              <Label htmlFor="fuel_level_start">مستوى الوقود</Label>
              <Select value={formData.fuel_level_start} onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_level_start: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">ممتلئ</SelectItem>
                  <SelectItem value="three_quarters">ثلاثة أرباع</SelectItem>
                  <SelectItem value="half">نصف</SelectItem>
                  <SelectItem value="quarter">ربع</SelectItem>
                  <SelectItem value="empty">فارغ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment_method">طريقة الدفع</Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                  <SelectItem value="bank_transfer">حوالة بنكية</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="أي ملاحظات أو شروط خاصة..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? 'جاري الحفظ...' : 'إنشاء العقد'}
        </Button>
      </div>
    </form>
  );
};
