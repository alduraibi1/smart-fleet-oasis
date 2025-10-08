
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, Car, CreditCard, FileText, CheckCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCustomers } from '@/hooks/useCustomers';
import { useVehicles } from '@/hooks/useVehicles';
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';

interface ContractFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: 'اختيار العميل', icon: User },
  { id: 2, title: 'اختيار المركبة', icon: Car },
  { id: 3, title: 'تفاصيل العقد', icon: CalendarDays },
  { id: 4, title: 'الشروط المالية', icon: CreditCard },
  { id: 5, title: 'المراجعة والتأكيد', icon: CheckCircle },
];

export const ContractFormWizard: React.FC<ContractFormWizardProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    dailyRate: '',
    totalAmount: '',
    depositAmount: '1000',
    insuranceAmount: '500',
    additionalCharges: '0',
    discountAmount: '0',
    paymentMethod: 'cash',
    pickupLocation: '',
    returnLocation: '',
    mileageStart: '',
    fuelLevelStart: 'full',
    notes: '',
    termsConditions: '',
    vatIncluded: false,
  });

  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { createContract } = useContracts();
  const { toast } = useToast();

  const calculateContractDetails = () => {
    if (formData.startDate && formData.endDate && formData.dailyRate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const baseAmount = days * parseFloat(formData.dailyRate);
      const insurance = parseFloat(formData.insuranceAmount) || 0;
      const additional = parseFloat(formData.additionalCharges) || 0;
      const discount = parseFloat(formData.discountAmount) || 0;
      const total = baseAmount + insurance + additional - discount;
      
      setFormData(prev => ({ 
        ...prev, 
        totalAmount: total.toString() 
      }));
      
      return { days, baseAmount, total };
    }
    return { days: 0, baseAmount: 0, total: 0 };
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const contractData = {
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        daily_rate: parseFloat(formData.dailyRate),
        total_amount: parseFloat(formData.totalAmount),
        deposit_amount: parseFloat(formData.depositAmount),
        insurance_amount: parseFloat(formData.insuranceAmount),
        additional_charges: parseFloat(formData.additionalCharges),
        discount_amount: parseFloat(formData.discountAmount),
        payment_method: formData.paymentMethod,
        pickup_location: formData.pickupLocation,
        return_location: formData.returnLocation,
        mileage_start: formData.mileageStart ? parseInt(formData.mileageStart) : undefined,
        fuel_level_start: formData.fuelLevelStart,
        notes: formData.notes,
        terms_conditions: formData.termsConditions,
      };

      await createContract(contractData);
      onOpenChange(false);
      setCurrentStep(1);
      setFormData({
        customerId: '',
        vehicleId: '',
        startDate: '',
        endDate: '',
        dailyRate: '',
        totalAmount: '',
        depositAmount: '1000',
        insuranceAmount: '500',
        additionalCharges: '0',
        discountAmount: '0',
        paymentMethod: 'cash',
        pickupLocation: '',
        returnLocation: '',
        mileageStart: '',
        fuelLevelStart: 'full',
        notes: '',
        termsConditions: '',
        vatIncluded: false,
      });
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
  const { days, baseAmount, total } = calculateContractDetails();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">اختيار العميل</h3>
            <div>
              <Label htmlFor="customer">العميل</Label>
              <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-sm text-muted-foreground">{customer.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCustomer && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">الهوية:</span>
                      <span className="ml-2">{selectedCustomer.national_id}</span>
                    </div>
                    <div>
                      <span className="font-medium">رخصة القيادة:</span>
                      <span className="ml-2">{selectedCustomer.license_number}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">اختيار المركبة</h3>
            <div>
              <Label htmlFor="vehicle">المركبة</Label>
              <Select value={formData.vehicleId} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.filter(v => v.status === 'available').map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                        <span className="text-sm text-muted-foreground">
                          {vehicle.plate_number} - {vehicle.daily_rate} ر.س/يوم
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedVehicle && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">اللوحة:</span>
                      <span className="ml-2">{selectedVehicle.plate_number}</span>
                    </div>
                    <div>
                      <span className="font-medium">السعر اليومي:</span>
                      <span className="ml-2">{selectedVehicle.daily_rate} ر.س</span>
                    </div>
                    <div>
                      <span className="font-medium">الحالة:</span>
                      <Badge variant="secondary" className="ml-2">متاحة</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">تفاصيل العقد</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">تاريخ البداية</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, startDate: e.target.value }));
                    setTimeout(calculateContractDetails, 100);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="endDate">تاريخ النهاية</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, endDate: e.target.value }));
                    setTimeout(calculateContractDetails, 100);
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupLocation">مكان الاستلام</Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  placeholder="مكان استلام المركبة"
                />
              </div>
              <div>
                <Label htmlFor="returnLocation">مكان الإرجاع</Label>
                <Input
                  id="returnLocation"
                  value={formData.returnLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnLocation: e.target.value }))}
                  placeholder="مكان إرجاع المركبة"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mileageStart">العداد عند الاستلام</Label>
                <Input
                  id="mileageStart"
                  type="number"
                  value={formData.mileageStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileageStart: e.target.value }))}
                  placeholder="قراءة العداد"
                />
              </div>
              <div>
                <Label htmlFor="fuelLevelStart">مستوى الوقود</Label>
                <Select value={formData.fuelLevelStart} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelLevelStart: value }))}>
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
              </div>
            </div>

            {days > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <span className="text-lg font-semibold text-blue-800">
                      مدة العقد: {days} يوم
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">الشروط المالية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dailyRate">السعر اليومي (ر.س)</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  step="0.01"
                  value={formData.dailyRate}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, dailyRate: e.target.value }));
                    setTimeout(calculateContractDetails, 100);
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="depositAmount">الوديعة (ر.س)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>المبلغ المدفوع من قبل العميل كضمان، ويُسترد بالكامل عند تسليم المركبة وإنهاء العقد بدون أضرار أو مخالفات</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="depositAmount"
                  type="number"
                  min={1000}
                  step="0.01"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceAmount">التأمين (ر.س)</Label>
                <Input
                  id="insuranceAmount"
                  type="number"
                  step="0.01"
                  value={formData.insuranceAmount}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, insuranceAmount: e.target.value }));
                    setTimeout(calculateContractDetails, 100);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="discountAmount">الخصم (ر.س)</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, discountAmount: e.target.value }));
                    setTimeout(calculateContractDetails, 100);
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="card">بطاقة ائتمانية</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* خيار الضريبة */}
            <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="vatIncluded"
                  checked={formData.vatIncluded}
                  onChange={(e) => setFormData(prev => ({ ...prev, vatIncluded: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="vatIncluded" className="font-medium cursor-pointer">
                  شامل ضريبة القيمة المضافة (15%)
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2 mr-7">
                عند التفعيل، سيتم إضافة 15% ضريبة على المبلغ الأساسي
              </p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المبلغ الأساسي ({days} يوم):</span>
                    <span>{baseAmount} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التأمين:</span>
                    <span>{formData.insuranceAmount} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الخصم:</span>
                    <span>-{formData.discountAmount} ر.س</span>
                  </div>
                  <hr />
                  {formData.vatIncluded && (
                    <>
                      <div className="flex justify-between">
                        <span>المجموع قبل الضريبة:</span>
                        <span>{total} ر.س</span>
                      </div>
                      <div className="flex justify-between text-yellow-700">
                        <span>ضريبة القيمة المضافة (15%):</span>
                        <span>{(total * 0.15).toFixed(2)} ر.س</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold text-lg text-primary">
                        <span>المجموع شامل الضريبة:</span>
                        <span>{(total * 1.15).toFixed(2)} ر.س</span>
                      </div>
                    </>
                  )}
                  {!formData.vatIncluded && (
                    <div className="flex justify-between font-bold text-lg">
                      <span>المجموع:</span>
                      <span>{total} ر.س</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">مراجعة وتأكيد العقد</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">بيانات العميل</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div><strong>الاسم:</strong> {selectedCustomer?.name}</div>
                  <div><strong>الهاتف:</strong> {selectedCustomer?.phone}</div>
                  <div><strong>الهوية:</strong> {selectedCustomer?.national_id}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">بيانات المركبة</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div><strong>المركبة:</strong> {selectedVehicle?.brand} {selectedVehicle?.model}</div>
                  <div><strong>اللوحة:</strong> {selectedVehicle?.plate_number}</div>
                  <div><strong>السعر:</strong> {formData.dailyRate} ر.س/يوم</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">فترة العقد</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div><strong>من:</strong> {new Date(formData.startDate).toLocaleDateString('ar-SA')}</div>
                  <div><strong>إلى:</strong> {new Date(formData.endDate).toLocaleDateString('ar-SA')}</div>
                  <div><strong>المدة:</strong> {days} يوم</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">التفاصيل المالية</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div><strong>المبلغ الإجمالي:</strong> {total} ر.س</div>
                  <div><strong>الوديعة:</strong> {formData.depositAmount} ر.س</div>
                  <div><strong>طريقة الدفع:</strong> {formData.paymentMethod === 'cash' ? 'نقداً' : formData.paymentMethod}</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                placeholder="أي ملاحظات خاصة بالعقد..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-background border-muted-foreground text-muted-foreground'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            إغلاق
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                السابق
              </Button>
            )}
            
            {currentStep < 5 ? (
              <Button onClick={nextStep}>
                التالي
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                إنشاء العقد
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
