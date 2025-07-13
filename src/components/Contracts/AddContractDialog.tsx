import { useState } from 'react';
import { Plus, User, Car, Calendar, FileText, Upload } from 'lucide-react';
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

interface ContractFormData {
  customerId: string;
  vehicleId: string;
  contractType: 'daily' | 'monthly';
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  securityDeposit: number;
  terms: string;
  notes: string;
}

export default function AddContractDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>({
    customerId: '',
    vehicleId: '',
    contractType: 'daily',
    startDate: '',
    endDate: '',
    totalDays: 0,
    dailyRate: 0,
    totalAmount: 0,
    securityDeposit: 0,
    terms: 'شروط وأحكام عامة للإيجار:\n1. دفع التأمين المطلوب\n2. إرجاع المركبة في الموعد المحدد\n3. المحافظة على نظافة المركبة\n4. عدم التدخين داخل المركبة',
    notes: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const { toast } = useToast();

  const calculateAmount = () => {
    if (formData.startDate && formData.endDate && formData.dailyRate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      const totalAmount = daysDiff * formData.dailyRate;
      
      setFormData(prev => ({
        ...prev,
        totalDays: daysDiff,
        totalAmount: totalAmount,
        securityDeposit: Math.ceil(totalAmount * 0.2), // 20% security deposit
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
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }

    // Here you would typically save the contract to your backend
    const contractId = `C${Date.now()}`;
    
    toast({
      title: "تم إنشاء العقد بنجاح",
      description: `رقم العقد: ${contractId}`,
    });
    
    setOpen(false);
    // Reset form
    setFormData({
      customerId: '',
      vehicleId: '',
      contractType: 'daily',
      startDate: '',
      endDate: '',
      totalDays: 0,
      dailyRate: 0,
      totalAmount: 0,
      securityDeposit: 0,
      terms: 'شروط وأحكام عامة للإيجار:\n1. دفع التأمين المطلوب\n2. إرجاع المركبة في الموعد المحدد\n3. المحافظة على نظافة المركبة\n4. عدم التدخين داخل المركبة',
      notes: '',
    });
    setDocuments([]);
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicleId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-rental-primary hover:bg-rental-primary/90">
          <Plus className="h-4 w-4 ml-2" />
          عقد جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إنشاء عقد إيجار جديد</DialogTitle>
          <DialogDescription>
            املأ البيانات التالية لإنشاء عقد إيجار جديد
          </DialogDescription>
        </DialogHeader>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                تفاصيل العقد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, startDate: e.target.value }));
                      setTimeout(calculateAmount, 100);
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
                      setTimeout(calculateAmount, 100);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dailyRate">السعر اليومي (ر.س)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) || 0 }));
                      setTimeout(calculateAmount, 100);
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
                  <span>إجمالي المبلغ:</span>
                  <span className="font-bold">{formData.totalAmount.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>التأمين (20%):</span>
                  <span className="font-bold">{formData.securityDeposit.toLocaleString()} ر.س</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المبلغ الإجمالي:</span>
                    <span>{(formData.totalAmount + formData.securityDeposit).toLocaleString()} ر.س</span>
                  </div>
                </div>
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
            </CardContent>
          </Card>

          {/* Terms & Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                الشروط والمستندات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="documents">رفع المستندات</Label>
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

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} className="bg-rental-primary hover:bg-rental-primary/90">
            إنشاء العقد
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}