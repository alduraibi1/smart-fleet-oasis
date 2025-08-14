
import { useState, useEffect } from 'react';
import { Plus, User, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { useVehicles } from '@/hooks/useVehicles';
import { useContracts } from '@/hooks/useContracts';
import { 
  ValidationDisplay, 
  useContractValidation,
  ContractValidationErrors,
  FieldRequirement
} from './ContractValidation';
import { EnhancedContractForm } from './EnhancedContractForm';

interface ContractFormData {
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  subtotal: number;
  delegationFee: number;
  additionalCharges: number;
  discount: number;
  insuranceType: 'none' | 'percentage' | 'fixed';
  insurancePercentage: number;
  insuranceAmount: number;
  calculatedInsuranceAmount: number;
  vatEnabled: boolean;
  vatRate: number;
  vat: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
}

export default function AddContractDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>({
    customerId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    dailyRate: 0,
    subtotal: 0,
    delegationFee: 0,
    additionalCharges: 0,
    discount: 0,
    insuranceType: 'none',
    insurancePercentage: 20,
    insuranceAmount: 0,
    calculatedInsuranceAmount: 0,
    vatEnabled: false,
    vatRate: 15,
    vat: 0,
    totalAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<ContractValidationErrors>([]);
  const { toast } = useToast();
  const { validateContract } = useContractValidation();

  // Hooks for data fetching
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const { createContract } = useContracts();

  // Filter available vehicles
  const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'available');

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleId,
        dailyRate: vehicle.daily_rate,
      }));
    }
  };

  const handleSubmit = async () => {
    // Prepare contract data for validation with only required fields
    const contractData = {
      customer_id: formData.customerId,
      vehicle_id: formData.vehicleId,
      start_date: formData.startDate,
      end_date: formData.endDate,
      daily_rate: formData.dailyRate,
      total_amount: formData.totalAmount,
      insurance_type: formData.insuranceType,
      insurance_amount: formData.calculatedInsuranceAmount,
      insurance_percentage: formData.insuranceType === 'percentage' ? formData.insurancePercentage : undefined,
      vat_enabled: formData.vatEnabled,
      vat_rate: formData.vatEnabled ? formData.vatRate : undefined,
      additional_charges: formData.additionalCharges,
      discount_amount: formData.discount,
      delegation_fee: formData.delegationFee,
      payment_method: formData.paymentMethod,
      payment_status: formData.paymentStatus,
      notes: formData.notes,
    };

    const validation = validateContract(contractData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء الموجودة في النموذج",
      });
      return;
    }

    setValidationErrors([]);

    try {
      const contractDataForSubmission = {
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        daily_rate: formData.dailyRate,
        total_amount: formData.totalAmount,
        deposit_amount: formData.calculatedInsuranceAmount,
        insurance_amount: formData.calculatedInsuranceAmount,
        additional_charges: formData.additionalCharges || 0,
        discount_amount: formData.discount || 0,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentStatus,
        notes: formData.notes || '',
      };

      await createContract(contractDataForSubmission);
      setOpen(false);
      resetForm();
      toast({
        title: "تم إنشاء العقد",
        description: "تم إنشاء العقد بنجاح",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء العقد",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      vehicleId: '',
      startDate: '',
      endDate: '',
      totalDays: 0,
      dailyRate: 0,
      subtotal: 0,
      delegationFee: 0,
      additionalCharges: 0,
      discount: 0,
      insuranceType: 'none',
      insurancePercentage: 20,
      insuranceAmount: 0,
      calculatedInsuranceAmount: 0,
      vatEnabled: false,
      vatRate: 15,
      vat: 0,
      totalAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      notes: '',
    });
    setValidationErrors([]);
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicleId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 ml-2" />
          عقد جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إنشاء عقد إيجار جديد</DialogTitle>
          <DialogDescription>
            املأ البيانات المطلوبة لإنشاء عقد إيجار. الحقول المميزة بـ (*) إلزامية، والباقي اختياري.
          </DialogDescription>
        </DialogHeader>

        {/* Validation Errors Display */}
        <ValidationDisplay errors={validationErrors} />

        <div className="space-y-6">
          {/* Customer and Vehicle Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  اختيار العميل
                  <FieldRequirement required />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer" className="flex items-center gap-1">
                    العميل
                    <FieldRequirement required />
                  </Label>
                  <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger className="border-red-200 focus:border-red-500">
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          <div className="flex flex-col">
                            <span>{customer.name}</span>
                            <span className="text-sm text-muted-foreground">{customer.phone}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCustomer && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="space-y-1 text-sm">
                      <p><strong>الهوية:</strong> {selectedCustomer.national_id}</p>
                      <p><strong>رخصة القيادة:</strong> {selectedCustomer.license_number}</p>
                      <p><strong>انتهاء الرخصة:</strong> {new Date(selectedCustomer.license_expiry).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  اختيار المركبة
                  <FieldRequirement required />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vehicle" className="flex items-center gap-1">
                    المركبة
                    <FieldRequirement required />
                  </Label>
                  <Select value={formData.vehicleId} onValueChange={handleVehicleSelect}>
                    <SelectTrigger className="border-red-200 focus:border-red-500">
                      <SelectValue placeholder="اختر المركبة المتاحة" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span>{vehicle.brand} {vehicle.model} {vehicle.year}</span>
                              <span className="text-sm text-muted-foreground">{vehicle.plate_number}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedVehicle && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="space-y-1 text-sm">
                      <p><strong>اللون:</strong> {selectedVehicle.color}</p>
                      <p><strong>السعر اليومي:</strong> {selectedVehicle.daily_rate} ر.س</p>
                      <p><strong>الكيلومترات:</strong> {selectedVehicle.mileage.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Contract Form */}
          <EnhancedContractForm
            formData={formData}
            setFormData={setFormData}
            selectedCustomer={selectedCustomer}
            selectedVehicle={selectedVehicle}
          />
        </div>

        <div className="flex justify-between gap-4 pt-6 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary-hover"
            disabled={!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate || !formData.dailyRate}
          >
            إنشاء العقد
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
