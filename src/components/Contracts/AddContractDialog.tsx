import { useState } from 'react';
import { Plus, User, Car, Calendar, FileText, Upload, CreditCard, MapPin, Shield, Camera, FileCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@/types/vehicle';

// Mock data for available vehicles and customers
const availableVehicles: Vehicle[] = [
  {
    id: 'V001',
    plateNumber: 'أ ب ج 1234',
    brand: 'تويوتا',
    model: 'كامري',
    year: 2023,
    color: 'أبيض',
    status: 'available',
    dailyRate: 150,
    mileage: 25000,
    vin: 'JT2BF18K9X0123456',
    engineNumber: 'ENG123456',
    chassisNumber: 'CHS123456',
    fuelType: 'gasoline',
    transmission: 'automatic',
    seatingCapacity: 5,
    features: ['مكيف', 'نظام صوتي', 'كاميرا خلفية'],
    ownerId: 'O001',
    owner: {
      id: 'O001',
      name: 'محمد أحمد',
      phone: '0501234567',
      email: 'mohamed@example.com',
      nationalId: '1234567890',
      address: 'الرياض',
      isActive: true,
    },
    documents: [],
    images: [],
    maintenance: {
      status: 'completed',
      lastMaintenanceDate: '2024-01-15',
      nextMaintenanceDate: '2024-07-15',
    },
    location: {
      isTracked: false,
    },
    purchase: {},
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'V002',
    plateNumber: 'هـ و ز 5678',
    brand: 'نيسان',
    model: 'التيما',
    year: 2022,
    color: 'أسود',
    status: 'available',
    dailyRate: 130,
    mileage: 30000,
    vin: 'NIS2BF18K9X0123456',
    engineNumber: 'NISENG123456',
    chassisNumber: 'NISCHS123456',
    fuelType: 'gasoline',
    transmission: 'automatic',
    seatingCapacity: 5,
    features: ['مكيف', 'نظام ملاحة'],
    ownerId: 'O002',
    owner: {
      id: 'O002',
      name: 'فاطمة سعد',
      phone: '0507654321',
      email: 'fatima@example.com',
      nationalId: '0987654321',
      address: 'جدة',
      isActive: true,
    },
    documents: [],
    images: [],
    maintenance: {
      status: 'completed',
    },
    location: {
      isTracked: false,
    },
    purchase: {},
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
];

const customers = [
  {
    id: 'CUST001',
    name: 'أحمد محمد علي',
    phone: '0501234567',
    email: 'ahmed@example.com',
    nationalId: '1234567890',
    licenseNumber: 'L123456789',
    licenseExpiry: '2025-12-31',
    address: 'الرياض، حي النزهة',
  },
  {
    id: 'CUST002',
    name: 'فاطمة أحمد خالد',
    phone: '0507654321',
    email: 'fatima@example.com',
    nationalId: '0987654321',
    licenseNumber: 'L987654321',
    licenseExpiry: '2026-06-30',
    address: 'جدة، حي الصفا',
  },
];

const staff = [
  { id: 'STAFF001', name: 'خالد أحمد', role: 'موظف تسليم' },
  { id: 'STAFF002', name: 'سارة محمد', role: 'موظفة استلام' },
  { id: 'STAFF003', name: 'عبدالله سعد', role: 'مشرف عمليات' },
];

const locations = [
  'المكتب الرئيسي - الرياض',
  'فرع جدة',
  'فرع الدمام',
  'توصيل للعميل',
  'موقع خاص',
];

interface ContractFormData {
  // Basic Contract Info
  customerId: string;
  vehicleId: string;
  contractType: 'daily' | 'monthly';
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  
  // Financial Details
  delegationFee: number;
  vat: number;
  vatRate: number;
  additionalCharges: number;
  discount: number;
  securityDeposit: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  
  // Delivery & Pickup
  deliveryLocation: string;
  pickupLocation: string;
  deliveryTime: string;
  pickupTime: string;
  deliveryStaff: string;
  pickupStaff: string;
  emergencyContact: string;
  usageType: string;
  
  // Vehicle Inspection
  mileageAtDelivery: number;
  fuelLevelAtDelivery: number;
  conditionAtDelivery: string;
  damagesAtDelivery: string;
  
  // Insurance & Emergency
  insuranceCompany: string;
  policyNumber: string;
  insuranceExpiry: string;
  coverage: string;
  
  // Terms & Conditions
  maxMileagePerDay: number;
  allowedAreas: string;
  lateReturnPerHour: number;
  excessMileagePerKm: number;
  smokingFine: number;
  cleaningFee: number;
  damageFee: number;
  cancellationPolicy: string;
  refundPolicy: string;
  autoRenewal: boolean;
  
  // Notes
  terms: string;
  notes: string;
}

export default function AddContractDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ContractFormData>({
    // Basic
    customerId: '',
    vehicleId: '',
    contractType: 'daily',
    startDate: '',
    endDate: '',
    totalDays: 0,
    dailyRate: 0,
    
    // Financial
    delegationFee: 200, // Default delegation fee
    vat: 0,
    vatRate: 15,
    additionalCharges: 0,
    discount: 0,
    securityDeposit: 0,
    totalAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    
    // Delivery & Pickup
    deliveryLocation: '',
    pickupLocation: '',
    deliveryTime: '',
    pickupTime: '',
    deliveryStaff: '',
    pickupStaff: '',
    emergencyContact: '',
    usageType: 'personal',
    
    // Vehicle Inspection
    mileageAtDelivery: 0,
    fuelLevelAtDelivery: 100,
    conditionAtDelivery: 'ممتازة',
    damagesAtDelivery: '',
    
    // Insurance
    insuranceCompany: '',
    policyNumber: '',
    insuranceExpiry: '',
    coverage: '',
    
    // Terms
    maxMileagePerDay: 300,
    allowedAreas: 'داخل المدينة',
    lateReturnPerHour: 20,
    excessMileagePerKm: 2,
    smokingFine: 500,
    cleaningFee: 100,
    damageFee: 1000,
    cancellationPolicy: 'يمكن الإلغاء قبل 24 ساعة',
    refundPolicy: 'استرداد كامل في حالة الإلغاء المبكر',
    autoRenewal: false,
    
    // Notes
    terms: 'شروط وأحكام عامة للإيجار:\n1. دفع التأمين المطلوب\n2. إرجاع المركبة في الموعد المحدد\n3. المحافظة على نظافة المركبة\n4. عدم التدخين داخل المركبة\n5. الالتزام بقوانين المرور\n6. عدم تجاوز الحد الأقصى للكيلومترات',
    notes: '',
  });
  
  const [documents, setDocuments] = useState<File[]>([]);
  const [inspectionImages, setInspectionImages] = useState<File[]>([]);
  const { toast } = useToast();

  const calculateFinancials = () => {
    if (formData.startDate && formData.endDate && formData.dailyRate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      const subtotal = daysDiff * formData.dailyRate;
      const vat = (subtotal + formData.additionalCharges + formData.delegationFee - formData.discount) * (formData.vatRate / 100);
      const securityDeposit = Math.ceil(subtotal * 0.2);
      const totalAmount = subtotal + formData.additionalCharges + formData.delegationFee + vat - formData.discount;
      
      setFormData(prev => ({
        ...prev,
        totalDays: daysDiff,
        vat: vat,
        securityDeposit: securityDeposit,
        totalAmount: totalAmount,
      }));
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleId,
        dailyRate: vehicle.dailyRate,
        mileageAtDelivery: vehicle.mileage,
      }));
    }
  };

  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CR-${year}-${random}`;
  };

  const handleSubmit = () => {
    if (!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة في التبويبات الأساسية",
      });
      return;
    }

    const contractNumber = generateContractNumber();
    
    toast({
      title: "تم إنشاء العقد بنجاح",
      description: `رقم العقد: ${contractNumber}`,
    });
    
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      vehicleId: '',
      contractType: 'daily',
      startDate: '',
      endDate: '',
      totalDays: 0,
      dailyRate: 0,
      delegationFee: 200,
      vat: 0,
      vatRate: 15,
      additionalCharges: 0,
      discount: 0,
      securityDeposit: 0,
      totalAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      deliveryLocation: '',
      pickupLocation: '',
      deliveryTime: '',
      pickupTime: '',
      deliveryStaff: '',
      pickupStaff: '',
      emergencyContact: '',
      usageType: 'personal',
      mileageAtDelivery: 0,
      fuelLevelAtDelivery: 100,
      conditionAtDelivery: 'ممتازة',
      damagesAtDelivery: '',
      insuranceCompany: '',
      policyNumber: '',
      insuranceExpiry: '',
      coverage: '',
      maxMileagePerDay: 300,
      allowedAreas: 'داخل المدينة',
      lateReturnPerHour: 20,
      excessMileagePerKm: 2,
      smokingFine: 500,
      cleaningFee: 100,
      damageFee: 1000,
      cancellationPolicy: 'يمكن الإلغاء قبل 24 ساعة',
      refundPolicy: 'استرداد كامل في حالة الإلغاء المبكر',
      autoRenewal: false,
      terms: 'شروط وأحكام عامة للإيجار:\n1. دفع التأمين المطلوب\n2. إرجاع المركبة في الموعد المحدد\n3. المحافظة على نظافة المركبة\n4. عدم التدخين داخل المركبة\n5. الالتزام بقوانين المرور\n6. عدم تجاوز الحد الأقصى للكيلومترات',
      notes: '',
    });
    setDocuments([]);
    setInspectionImages([]);
    setActiveTab('basic');
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إنشاء عقد إيجار جديد</DialogTitle>
          <DialogDescription>
            املأ البيانات التالية لإنشاء عقد إيجار شامل ومتكامل
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">أساسي</TabsTrigger>
            <TabsTrigger value="financial">مالي</TabsTrigger>
            <TabsTrigger value="delivery">تسليم/استلام</TabsTrigger>
            <TabsTrigger value="inspection">فحص المركبة</TabsTrigger>
            <TabsTrigger value="insurance">التأمين</TabsTrigger>
            <TabsTrigger value="terms">الشروط</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    بيانات العميل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer">اختر العميل</Label>
                    <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                      <SelectTrigger>
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
                        <p><strong>الهوية:</strong> {selectedCustomer.nationalId}</p>
                        <p><strong>رخصة القيادة:</strong> {selectedCustomer.licenseNumber}</p>
                        <p><strong>انتهاء الرخصة:</strong> {selectedCustomer.licenseExpiry}</p>
                        <p><strong>العنوان:</strong> {selectedCustomer.address}</p>
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
                    بيانات المركبة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle">اختر المركبة</Label>
                    <Select value={formData.vehicleId} onValueChange={handleVehicleSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المركبة المتاحة" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col">
                                <span>{vehicle.brand} {vehicle.model} {vehicle.year}</span>
                                <span className="text-sm text-muted-foreground">{vehicle.plateNumber}</span>
                              </div>
                              <Badge variant="secondary">{vehicle.dailyRate} ر.س/يوم</Badge>
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
                        <p><strong>الكيلومترات:</strong> {selectedVehicle.mileage.toLocaleString()}</p>
                        <p><strong>نوع الوقود:</strong> {selectedVehicle.fuelType === 'gasoline' ? 'بنزين' : 'ديزل'}</p>
                        <p><strong>المالك:</strong> {selectedVehicle.owner.name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contract Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    تفاصيل العقد
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contractType">نوع العقد</Label>
                      <Select value={formData.contractType} onValueChange={(value: 'daily' | 'monthly') => setFormData(prev => ({ ...prev, contractType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">يومي</SelectItem>
                          <SelectItem value="monthly">شهري</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="startDate">تاريخ البداية</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, startDate: e.target.value }));
                          setTimeout(calculateFinancials, 100);
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
                          setTimeout(calculateFinancials, 100);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dailyRate">السعر اليومي (ر.س)</Label>
                      <Input
                        id="dailyRate"
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) || 0 }));
                          setTimeout(calculateFinancials, 100);
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="totalDays">عدد الأيام</Label>
                      <Input
                        id="totalDays"
                        type="number"
                        value={formData.totalDays}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div>
                      <Label htmlFor="usageType">نوع الاستخدام</Label>
                      <Select value={formData.usageType} onValueChange={(value) => setFormData(prev => ({ ...prev, usageType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">شخصي</SelectItem>
                          <SelectItem value="commercial">تجاري</SelectItem>
                          <SelectItem value="tourism">سياحي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    التفاصيل المالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="delegationFee">مبلغ إنشاء التفويض (ر.س)</Label>
                      <Input
                        id="delegationFee"
                        type="number"
                        value={formData.delegationFee}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, delegationFee: parseFloat(e.target.value) || 0 }));
                          setTimeout(calculateFinancials, 100);
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalCharges">رسوم إضافية (ر.س)</Label>
                      <Input
                        id="additionalCharges"
                        type="number"
                        value={formData.additionalCharges}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, additionalCharges: parseFloat(e.target.value) || 0 }));
                          setTimeout(calculateFinancials, 100);
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="discount">خصم (ر.س)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }));
                          setTimeout(calculateFinancials, 100);
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor="vatRate">نسبة الضريبة (%)</Label>
                      <Input
                        id="vatRate"
                        type="number"
                        value={formData.vatRate}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, vatRate: parseFloat(e.target.value) || 15 }));
                          setTimeout(calculateFinancials, 100);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                      <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">نقداً</SelectItem>
                          <SelectItem value="transfer">تحويل بنكي</SelectItem>
                          <SelectItem value="credit_card">بطاقة ائتمانية</SelectItem>
                          <SelectItem value="installments">أقساط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="paymentStatus">حالة الدفع</Label>
                      <Select value={formData.paymentStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">مدفوع</SelectItem>
                          <SelectItem value="partial">مدفوع جزئياً</SelectItem>
                          <SelectItem value="pending">معلق</SelectItem>
                          <SelectItem value="overdue">متأخر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    الملخص المالي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>مبلغ الإيجار:</span>
                      <span className="font-bold">{(formData.totalDays * formData.dailyRate).toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مبلغ التفويض:</span>
                      <span className="font-bold">{formData.delegationFee.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رسوم إضافية:</span>
                      <span className="font-bold">{formData.additionalCharges.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>خصم:</span>
                      <span className="font-bold text-green-600">-{formData.discount.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ضريبة القيمة المضافة ({formData.vatRate}%):</span>
                      <span className="font-bold">{formData.vat.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>التأمين (20%):</span>
                      <span className="font-bold">{formData.securityDeposit.toLocaleString()} ر.س</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>المبلغ الإجمالي:</span>
                        <span>{formData.totalAmount.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>المبلغ الكلي مع التأمين:</span>
                        <span>{(formData.totalAmount + formData.securityDeposit).toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Delivery & Pickup Tab */}
          <TabsContent value="delivery" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    معلومات التسليم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryLocation">مكان التسليم</Label>
                    <Select value={formData.deliveryLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryLocation: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مكان التسليم" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="deliveryTime">وقت التسليم</Label>
                    <Input
                      id="deliveryTime"
                      type="datetime-local"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryStaff">الموظف المسؤول عن التسليم</Label>
                    <Select value={formData.deliveryStaff} onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryStaff: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    معلومات الاستلام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pickupLocation">مكان الاستلام</Label>
                    <Select value={formData.pickupLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, pickupLocation: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مكان الاستلام" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pickupTime">وقت الاستلام المتوقع</Label>
                    <Input
                      id="pickupTime"
                      type="datetime-local"
                      value={formData.pickupTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pickupStaff">الموظف المسؤول عن الاستلام</Label>
                    <Select value={formData.pickupStaff} onValueChange={(value) => setFormData(prev => ({ ...prev, pickupStaff: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">رقم الطوارئ</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="رقم التواصل في حالات الطوارئ"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicle Inspection Tab */}
          <TabsContent value="inspection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    فحص المركبة عند التسليم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mileageAtDelivery">قراءة العداد</Label>
                      <Input
                        id="mileageAtDelivery"
                        type="number"
                        value={formData.mileageAtDelivery}
                        onChange={(e) => setFormData(prev => ({ ...prev, mileageAtDelivery: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fuelLevelAtDelivery">مستوى الوقود (%)</Label>
                      <Input
                        id="fuelLevelAtDelivery"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.fuelLevelAtDelivery}
                        onChange={(e) => setFormData(prev => ({ ...prev, fuelLevelAtDelivery: parseFloat(e.target.value) || 100 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="conditionAtDelivery">حالة المركبة العامة</Label>
                    <Select value={formData.conditionAtDelivery} onValueChange={(value) => setFormData(prev => ({ ...prev, conditionAtDelivery: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ممتازة">ممتازة</SelectItem>
                        <SelectItem value="جيدة جداً">جيدة جداً</SelectItem>
                        <SelectItem value="جيدة">جيدة</SelectItem>
                        <SelectItem value="مقبولة">مقبولة</SelectItem>
                        <SelectItem value="تحتاج صيانة">تحتاج صيانة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="damagesAtDelivery">الأضرار الموجودة (إن وجدت)</Label>
                    <Textarea
                      id="damagesAtDelivery"
                      placeholder="وصف تفصيلي للخدوش أو الأضرار الموجودة..."
                      value={formData.damagesAtDelivery}
                      onChange={(e) => setFormData(prev => ({ ...prev, damagesAtDelivery: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inspectionImages">صور المركبة عند التسليم</Label>
                    <Input
                      id="inspectionImages"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setInspectionImages(Array.from(e.target.files));
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      يفضل رفع صور من جميع الجهات وللوحة العدادات
                    </p>
                  </div>

                  {inspectionImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">الصور المرفقة:</p>
                      <div className="flex flex-wrap gap-2">
                        {inspectionImages.map((image, index) => (
                          <Badge key={index} variant="secondary">
                            {image.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    قائمة فحص شاملة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lights" />
                      <Label htmlFor="lights">الأضواء (أمامية وخلفية)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tires" />
                      <Label htmlFor="tires">الإطارات وضغط الهواء</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="brakes" />
                      <Label htmlFor="brakes">المكابح</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="engine" />
                      <Label htmlFor="engine">المحرك والزيت</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="interior" />
                      <Label htmlFor="interior">النظافة الداخلية</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="exterior" />
                      <Label htmlFor="exterior">النظافة الخارجية</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="documents" />
                      <Label htmlFor="documents">أوراق المركبة</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="accessories" />
                      <Label htmlFor="accessories">الإكسسوارات والأدوات</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  معلومات التأمين والطوارئ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="insuranceCompany">شركة التأمين</Label>
                    <Input
                      id="insuranceCompany"
                      placeholder="اسم شركة التأمين"
                      value={formData.insuranceCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="policyNumber">رقم وثيقة التأمين</Label>
                    <Input
                      id="policyNumber"
                      placeholder="رقم الوثيقة"
                      value={formData.policyNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="insuranceExpiry">تاريخ انتهاء التأمين</Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={formData.insuranceExpiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverage">نوع التغطية</Label>
                    <Select value={formData.coverage} onValueChange={(value) => setFormData(prev => ({ ...prev, coverage: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التغطية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="شامل">تأمين شامل</SelectItem>
                        <SelectItem value="ضد الغير">تأمين ضد الغير</SelectItem>
                        <SelectItem value="محدود">تأمين محدود</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms & Conditions Tab */}
          <TabsContent value="terms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    القيود والشروط
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxMileagePerDay">الحد الأقصى للكيلومترات يومياً</Label>
                      <Input
                        id="maxMileagePerDay"
                        type="number"
                        value={formData.maxMileagePerDay}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxMileagePerDay: parseFloat(e.target.value) || 300 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="allowedAreas">المناطق المسموحة</Label>
                      <Input
                        id="allowedAreas"
                        placeholder="داخل المدينة، خارج المدينة..."
                        value={formData.allowedAreas}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowedAreas: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lateReturnPerHour">غرامة التأخير في الإرجاع (ر.س/ساعة)</Label>
                      <Input
                        id="lateReturnPerHour"
                        type="number"
                        value={formData.lateReturnPerHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, lateReturnPerHour: parseFloat(e.target.value) || 20 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="excessMileagePerKm">غرامة تجاوز الكيلومترات (ر.س/كم)</Label>
                      <Input
                        id="excessMileagePerKm"
                        type="number"
                        value={formData.excessMileagePerKm}
                        onChange={(e) => setFormData(prev => ({ ...prev, excessMileagePerKm: parseFloat(e.target.value) || 2 }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="smokingFine">غرامة التدخين (ر.س)</Label>
                      <Input
                        id="smokingFine"
                        type="number"
                        value={formData.smokingFine}
                        onChange={(e) => setFormData(prev => ({ ...prev, smokingFine: parseFloat(e.target.value) || 500 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cleaningFee">رسوم التنظيف (ر.س)</Label>
                      <Input
                        id="cleaningFee"
                        type="number"
                        value={formData.cleaningFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, cleaningFee: parseFloat(e.target.value) || 100 }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="damageFee">رسوم الأضرار (ر.س)</Label>
                      <Input
                        id="damageFee"
                        type="number"
                        value={formData.damageFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, damageFee: parseFloat(e.target.value) || 1000 }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoRenewal" 
                      checked={formData.autoRenewal}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRenewal: checked as boolean }))}
                    />
                    <Label htmlFor="autoRenewal">التجديد التلقائي للعقد</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    الشروط والأحكام والملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cancellationPolicy">سياسة الإلغاء</Label>
                    <Textarea
                      id="cancellationPolicy"
                      value={formData.cancellationPolicy}
                      onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="refundPolicy">سياسة الاسترداد</Label>
                    <Textarea
                      id="refundPolicy"
                      value={formData.refundPolicy}
                      onChange={(e) => setFormData(prev => ({ ...prev, refundPolicy: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="terms">شروط وأحكام العقد</Label>
                    <Textarea
                      id="terms"
                      rows={6}
                      value={formData.terms}
                      onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    />
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

                  <div>
                    <Label htmlFor="documents">رفع المستندات الإضافية</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files) {
                          setDocuments(Array.from(e.target.files));
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      يمكن رفع ملفات PDF أو صور (JPG, PNG)
                    </p>
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">المستندات المرفقة:</p>
                      <div className="flex flex-wrap gap-2">
                        {documents.map((doc, index) => (
                          <Badge key={index} variant="secondary">
                            {doc.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-4 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            إلغاء
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                toast({
                  title: "تم حفظ المسودة",
                  description: "تم حفظ بيانات العقد كمسودة",
                });
              }}
            >
              حفظ كمسودة
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary-hover"
            >
              إنشاء العقد
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}