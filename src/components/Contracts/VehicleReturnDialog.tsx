import { useState } from 'react';
import { ArrowLeft, Camera, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface VehicleCondition {
  exterior: 'excellent' | 'good' | 'fair' | 'damaged';
  interior: 'excellent' | 'good' | 'fair' | 'damaged';
  tires: 'excellent' | 'good' | 'fair' | 'damaged';
  engine: 'excellent' | 'good' | 'fair' | 'damaged';
}

interface ReturnFormData {
  contractId: string;
  returnDate: string;
  returnTime: string;
  currentMileage: number;
  fuelLevel: number;
  condition: VehicleCondition;
  damageNotes: string;
  additionalCharges: {
    lateFee: number;
    fuelCharge: number;
    damageFee: number;
    cleaningFee: number;
    other: number;
    otherDescription: string;
  };
  returnNotes: string;
  customerSignature: boolean;
  inspectorName: string;
}

// Mock active contracts
const activeContracts = [
  {
    id: 'C001',
    customerName: 'أحمد محمد علي',
    vehicleModel: 'تويوتا كامري 2023',
    vehiclePlate: 'أ ب ج 1234',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    dailyRate: 150,
    startMileage: 25000,
    status: 'active'
  },
  {
    id: 'C002',
    customerName: 'فاطمة أحمد',
    vehicleModel: 'نيسان التيما 2022',
    vehiclePlate: 'هـ و ز 5678',
    startDate: '2024-02-01',
    endDate: '2024-08-01',
    dailyRate: 130,
    startMileage: 30000,
    status: 'active'
  },
];

const conditionOptions = {
  excellent: { label: 'ممتاز', color: 'bg-green-100 text-green-800' },
  good: { label: 'جيد', color: 'bg-blue-100 text-blue-800' },
  fair: { label: 'مقبول', color: 'bg-yellow-100 text-yellow-800' },
  damaged: { label: 'تالف', color: 'bg-red-100 text-red-800' },
};

interface VehicleReturnDialogProps {
  contractId?: string;
}

export default function VehicleReturnDialog({ contractId }: VehicleReturnDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReturnFormData>({
    contractId: contractId || '',
    returnDate: new Date().toISOString().split('T')[0],
    returnTime: new Date().toTimeString().slice(0, 5),
    currentMileage: 0,
    fuelLevel: 100,
    condition: {
      exterior: 'excellent',
      interior: 'excellent',
      tires: 'excellent',
      engine: 'excellent',
    },
    damageNotes: '',
    additionalCharges: {
      lateFee: 0,
      fuelCharge: 0,
      damageFee: 0,
      cleaningFee: 0,
      other: 0,
      otherDescription: '',
    },
    returnNotes: '',
    customerSignature: false,
    inspectorName: '',
  });
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const { toast } = useToast();

  const selectedContract = activeContracts.find(c => c.id === formData.contractId);

  const calculateTotalCharges = () => {
    const { lateFee, fuelCharge, damageFee, cleaningFee, other } = formData.additionalCharges;
    return lateFee + fuelCharge + damageFee + cleaningFee + other;
  };

  const calculateRefund = () => {
    // Example: security deposit minus additional charges
    const securityDeposit = selectedContract ? selectedContract.dailyRate * 2 : 0; // Assume 2 days as security
    const totalCharges = calculateTotalCharges();
    return Math.max(0, securityDeposit - totalCharges);
  };

  const handleSubmit = () => {
    if (!formData.contractId || !formData.inspectorName || !formData.customerSignature) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة والتوقيع",
      });
      return;
    }

    // Here you would typically save the return data to your backend
    toast({
      title: "تم إرجاع المركبة بنجاح",
      description: "تم إنشاء تقرير الإرجاع وتحديث حالة العقد",
    });
    
    setOpen(false);
    setCurrentStep(1);
    // Reset form data
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-primary">
          <ArrowLeft className="h-4 w-4 ml-1" />
          إرجاع المركبة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إرجاع المركبة</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "اختر العقد وأدخل بيانات الإرجاع الأساسية"}
            {currentStep === 2 && "فحص حالة المركبة وتسجيل الأضرار"}
            {currentStep === 3 && "مراجعة الحساب النهائي وإنهاء الإرجاع"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step < 3 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات العقد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contract">اختر العقد</Label>
                  <Select value={formData.contractId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العقد المراد إرجاعه" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeContracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          <div className="flex flex-col">
                            <span>{contract.customerName} - {contract.vehicleModel}</span>
                            <span className="text-sm text-muted-foreground">{contract.vehiclePlate}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedContract && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>العميل:</strong> {selectedContract.customerName}</p>
                        <p><strong>المركبة:</strong> {selectedContract.vehicleModel}</p>
                        <p><strong>اللوحة:</strong> {selectedContract.vehiclePlate}</p>
                      </div>
                      <div>
                        <p><strong>تاريخ البداية:</strong> {selectedContract.startDate}</p>
                        <p><strong>تاريخ النهاية:</strong> {selectedContract.endDate}</p>
                        <p><strong>الكيلومترات الأولية:</strong> {selectedContract.startMileage.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>بيانات الإرجاع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="returnDate">تاريخ الإرجاع</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="returnTime">وقت الإرجاع</Label>
                    <Input
                      id="returnTime"
                      type="time"
                      value={formData.returnTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, returnTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentMileage">القراءة الحالية للعداد</Label>
                    <Input
                      id="currentMileage"
                      type="number"
                      value={formData.currentMileage}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentMileage: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuelLevel">مستوى الوقود (%)</Label>
                    <Input
                      id="fuelLevel"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.fuelLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="inspectorName">اسم المفتش</Label>
                  <Input
                    id="inspectorName"
                    value={formData.inspectorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspectorName: e.target.value }))}
                    placeholder="اسم الموظف المسؤول عن الفحص"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Vehicle Inspection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  فحص حالة المركبة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(formData.condition).map(([part, condition]) => (
                    <div key={part}>
                      <Label>
                        {part === 'exterior' && 'الخارج'}
                        {part === 'interior' && 'الداخل'}
                        {part === 'tires' && 'الإطارات'}
                        {part === 'engine' && 'المحرك'}
                      </Label>
                      <Select 
                        value={condition} 
                        onValueChange={(value: 'excellent' | 'good' | 'fair' | 'damaged') => 
                          setFormData(prev => ({ 
                            ...prev, 
                            condition: { ...prev.condition, [part]: value }
                          }))
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
                    value={formData.damageNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, damageNotes: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="returnImages">صور المركبة عند الإرجاع</Label>
                  <Input
                    id="returnImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setReturnImages(Array.from(e.target.files));
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    يُنصح بتصوير المركبة من جميع الجهات
                  </p>
                </div>
              </CardContent>
            </Card>

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
                    <Label htmlFor="lateFee">رسوم التأخير (ر.س)</Label>
                    <Input
                      id="lateFee"
                      type="number"
                      value={formData.additionalCharges.lateFee}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        additionalCharges: { 
                          ...prev.additionalCharges, 
                          lateFee: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuelCharge">رسوم الوقود (ر.س)</Label>
                    <Input
                      id="fuelCharge"
                      type="number"
                      value={formData.additionalCharges.fuelCharge}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        additionalCharges: { 
                          ...prev.additionalCharges, 
                          fuelCharge: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="damageFee">رسوم الأضرار (ر.س)</Label>
                    <Input
                      id="damageFee"
                      type="number"
                      value={formData.additionalCharges.damageFee}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        additionalCharges: { 
                          ...prev.additionalCharges, 
                          damageFee: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cleaningFee">رسوم التنظيف (ر.س)</Label>
                    <Input
                      id="cleaningFee"
                      type="number"
                      value={formData.additionalCharges.cleaningFee}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        additionalCharges: { 
                          ...prev.additionalCharges, 
                          cleaningFee: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherDescription">رسوم أخرى - الوصف</Label>
                  <Input
                    id="otherDescription"
                    value={formData.additionalCharges.otherDescription}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      additionalCharges: { 
                        ...prev.additionalCharges, 
                        otherDescription: e.target.value 
                      }
                    }))}
                    placeholder="وصف الرسوم الأخرى"
                  />
                </div>

                <div>
                  <Label htmlFor="other">مبلغ الرسوم الأخرى (ر.س)</Label>
                  <Input
                    id="other"
                    type="number"
                    value={formData.additionalCharges.other}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      additionalCharges: { 
                        ...prev.additionalCharges, 
                        other: parseFloat(e.target.value) || 0 
                      }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Final Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الحساب النهائي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>إجمالي الرسوم الإضافية:</span>
                    <span className="font-bold">{calculateTotalCharges().toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مبلغ التأمين المسترد:</span>
                    <span className="font-bold text-green-600">{calculateRefund().toLocaleString()} ر.س</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>المبلغ النهائي:</span>
                      <span className={calculateRefund() > 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculateRefund() > 0 ? '+' : ''}{calculateRefund().toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملاحظات الإرجاع</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="أي ملاحظات إضافية حول عملية الإرجاع..."
                  value={formData.returnNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnNotes: e.target.value }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تأكيد الإرجاع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signature"
                    checked={formData.customerSignature}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customerSignature: checked as boolean }))}
                  />
                  <Label htmlFor="signature" className="text-sm">
                    أؤكد أن العميل قد راجع ووافق على تقرير الإرجاع والحساب النهائي
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={currentStep === 1 ? () => setOpen(false) : prevStep}
          >
            {currentStep === 1 ? 'إلغاء' : 'السابق'}
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={nextStep} className="bg-primary hover:bg-primary-hover">
              التالي
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-hover">
              إنهاء الإرجاع
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}