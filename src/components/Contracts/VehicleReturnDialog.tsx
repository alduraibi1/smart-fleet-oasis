import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadMultipleContractImages } from '@/lib/supabase-storage';
import EnhancedDamageAssessment from './EnhancedDamageAssessment';
import { UnifiedDamage } from '@/types/damage';
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
import { enhancedToast } from '@/components/ui/enhanced-toast';

// NEW: confirmation dialog (shadcn)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Image preview component
import ReturnImagePreview from './ReturnImagePreview';
// Calculations utilities
import { 
  calculateLateFee, 
  calculateFuelCharge, 
  calculateMileageCharge,
  calculateContractDays 
} from '@/utils/returnCalculations';
// PDF generation
import { generateAndUploadPDF } from '@/utils/pdfGenerator';
// Return form for PDF generation
import { VehicleReturnForm } from './Print/VehicleReturnForm';

export interface VehicleCondition {
  exterior: 'excellent' | 'good' | 'fair' | 'damaged';
  interior: 'excellent' | 'good' | 'fair' | 'damaged';
  tires: 'excellent' | 'good' | 'fair' | 'damaged';
  engine: 'excellent' | 'good' | 'fair' | 'damaged';
}

export interface ReturnFormData {
  contractId: string;
  returnDate: string;
  returnTime: string;
  currentMileage: number;
  fuelLevel: number;
  condition: VehicleCondition;
  damageNotes: string;
  damages: UnifiedDamage[];
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

// Import useContracts hook for real data
import { useContracts } from '@/hooks/useContracts';

const conditionOptions = {
  excellent: { label: 'ممتاز', color: 'bg-green-100 text-green-800' },
  good: { label: 'جيد', color: 'bg-blue-100 text-blue-800' },
  fair: { label: 'مقبول', color: 'bg-yellow-100 text-yellow-800' },
  damaged: { label: 'تالف', color: 'bg-red-100 text-red-800' },
};

interface VehicleReturnDialogProps {
  contractId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VehicleReturnDialog({ contractId, open, onOpenChange }: VehicleReturnDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { contracts, completeContract } = useContracts();
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
    damages: [],
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
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Auto calculations toggles
  const [autoLateFee, setAutoLateFee] = useState(true);
  const [autoFuelCharge, setAutoFuelCharge] = useState(true);
  const [autoMileageCharge, setAutoMileageCharge] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Get active contracts for the dropdown
  const activeContracts = contracts.filter(c => c.status === 'active').map(c => ({
    id: c.id,
    customerName: c.customer?.name || 'غير محدد',
    vehicleModel: `${c.vehicle?.brand} ${c.vehicle?.model} ${c.vehicle?.year}`,
    vehiclePlate: c.vehicle?.plate_number || 'غير محدد',
    startDate: c.start_date,
    endDate: c.end_date,
    dailyRate: c.daily_rate,
    startMileage: c.mileage_start || 0,
    status: c.status
  }));

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

  // Auto-calculate late fee
  useEffect(() => {
    if (!autoLateFee || !selectedContract) return;

    const fee = calculateLateFee(
      selectedContract.endDate,
      formData.returnDate,
      formData.returnTime,
      selectedContract.dailyRate
    );

    setFormData(prev => ({
      ...prev,
      additionalCharges: {
        ...prev.additionalCharges,
        lateFee: fee
      }
    }));
  }, [autoLateFee, selectedContract?.endDate, selectedContract?.dailyRate, formData.returnDate, formData.returnTime]);

  // Auto-calculate fuel charge
  useEffect(() => {
    if (!autoFuelCharge || !selectedContract) return;

    const contracts = activeContracts.find(c => c.id === formData.contractId);
    if (!contracts) return;

    // Get fuel level at start from contract (assuming we have it)
    const startFuelLevel = 'full'; // Default or from contract data
    const charge = calculateFuelCharge(startFuelLevel, formData.fuelLevel);

    setFormData(prev => ({
      ...prev,
      additionalCharges: {
        ...prev.additionalCharges,
        fuelCharge: charge
      }
    }));
  }, [autoFuelCharge, formData.fuelLevel, formData.contractId]);

  // Auto-calculate mileage excess charge
  useEffect(() => {
    if (!autoMileageCharge || !selectedContract || !formData.currentMileage) return;

    const days = calculateContractDays(selectedContract.startDate, selectedContract.endDate);
    const allowedKmPerDay = 250; // Default: 250 km/day
    const charge = calculateMileageCharge(
      selectedContract.startMileage,
      formData.currentMileage,
      allowedKmPerDay,
      days,
      0.5 // 0.5 SAR per excess km
    );

    setFormData(prev => ({
      ...prev,
      additionalCharges: {
        ...prev.additionalCharges,
        other: charge
      }
    }));
  }, [autoMileageCharge, selectedContract, formData.currentMileage]);

  const handleSubmit = async () => {
    if (!formData.contractId || !formData.inspectorName || !formData.customerSignature) {
      enhancedToast.error('خطأ في البيانات', {
        description: 'يرجى ملء جميع الحقول المطلوبة والتوقيع',
        duration: 5000
      });
      return;
    }

    try {
      // رفع الصور أولاً إلى Supabase Storage
      let imageUrls: string[] = [];
      if (returnImages.length > 0) {
        setIsUploadingImages(true);
        enhancedToast.info('جاري رفع الصور...', {
          description: `يتم رفع ${returnImages.length} صورة`,
          duration: 3000
        });
        
        try {
          imageUrls = await uploadMultipleContractImages(
            returnImages,
            formData.contractId,
            'return'
          );
          setUploadedImageUrls(imageUrls);
          
          enhancedToast.success('تم رفع الصور بنجاح', {
            description: `تم رفع ${imageUrls.length} صورة`,
            duration: 3000
          });
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          enhancedToast.error('فشل رفع الصور', {
            description: 'حدث خطأ أثناء رفع الصور. سيتم المتابعة بدون الصور.',
            duration: 5000
          });
        } finally {
          setIsUploadingImages(false);
        }
      }

      const returnData = {
        actual_return_date: `${formData.returnDate}T${formData.returnTime}:00`,
        mileage_end: formData.currentMileage,
        fuel_level_end: formData.fuelLevel.toString(),
        additional_charges: calculateTotalCharges(),
        notes: `${formData.returnNotes}\n\nفحص المركبة:\n${Object.entries(formData.condition).map(([part, condition]) => `${part}: ${condition}`).join('\n')}\n\nالمفتش: ${formData.inspectorName}\n\nالأضرار: ${formData.damageNotes}${imageUrls.length > 0 ? `\n\nالصور: ${imageUrls.join(', ')}` : ''}`,
      };

      await completeContract(formData.contractId, returnData);
      
      enhancedToast.success('تم إرجاع المركبة بنجاح', {
        description: 'جارٍ توليد نموذج الإرجاع...',
        duration: 4000
      });

      // توليد نموذج الإرجاع تلقائياً
      try {
        const contract = selectedContract;
        if (contract) {
          setIsGeneratingPDF(true);
          // الانتظار قليلاً لضمان تحديث البيانات
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const pdfUrl = await generateAndUploadPDF(
            'return-form-preview',
            `return-${contract.id}-${Date.now()}.pdf`,
            formData.contractId,
            'return'
          );
          
          if (pdfUrl) {
            enhancedToast.success('تم إنشاء نموذج الإرجاع', {
              description: 'تم حفظ نموذج الإرجاع في قاعدة البيانات',
              duration: 5000
            });
          }
        }
      } catch (pdfError) {
        console.error('Error generating return PDF:', pdfError);
        enhancedToast.warning('تحذير', {
          description: 'تم تسجيل الإرجاع لكن فشل توليد نموذج PDF',
          duration: 6000
        });
      } finally {
        setIsGeneratingPDF(false);
      }

      onOpenChange(false);
      setCurrentStep(1);
      // Reset form data
      setFormData({
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
        damagePoints: [],
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
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        {/* We insert image preview just below file input */}
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

                {/* Vehicle Damage Diagram */}
                <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🚗</span>
                    مخطط تحديد الأضرار التفاعلي
                  </h3>
                  <VehicleDiagram
                    damages={formData.damagePoints}
                    onAddDamage={(damage) => {
                      const newDamage: DamagePoint = {
                        ...damage,
                        id: `damage-${Date.now()}-${Math.random()}`,
                      };
                      setFormData(prev => ({
                        ...prev,
                        damagePoints: [...prev.damagePoints, newDamage],
                      }));
                    }}
                    onRemoveDamage={(id) => {
                      setFormData(prev => ({
                        ...prev,
                        damagePoints: prev.damagePoints.filter(d => d.id !== id),
                      }));
                    }}
                    interactive
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
                  {/* NEW: thumbnails preview */}
                  <ReturnImagePreview
                    files={returnImages}
                    onRemove={(index) =>
                      setReturnImages(prev => prev.filter((_, i) => i !== index))
                    }
                  />
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
                {/* Auto calculations toggles */}
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="autoLateFee"
                      checked={autoLateFee}
                      onCheckedChange={(checked) => setAutoLateFee(!!checked)}
                    />
                    <Label htmlFor="autoLateFee" className="text-sm">
                      حساب رسوم التأخير تلقائياً
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="autoFuelCharge"
                      checked={autoFuelCharge}
                      onCheckedChange={(checked) => setAutoFuelCharge(!!checked)}
                    />
                    <Label htmlFor="autoFuelCharge" className="text-sm">
                      حساب رسوم الوقود تلقائياً (50 ر.س لكل ربع نقص)
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="autoMileageCharge"
                      checked={autoMileageCharge}
                      onCheckedChange={(checked) => setAutoMileageCharge(!!checked)}
                    />
                    <Label htmlFor="autoMileageCharge" className="text-sm">
                      حساب رسوم الكيلومترات الزائدة (0.5 ر.س/كم، 250 كم/يوم مسموح)
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lateFee">رسوم التأخير (ر.س)</Label>
                    <Input
                      id="lateFee"
                      type="number"
                      disabled={autoLateFee}
                      value={formData.additionalCharges.lateFee}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        additionalCharges: { 
                          ...prev.additionalCharges, 
                          lateFee: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                    {selectedContract && formData.returnDate > selectedContract.endDate && (
                      <p className="text-xs text-orange-600 mt-1">
                        تأخير عن موعد الانتهاء ({selectedContract.endDate})
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="fuelCharge">رسوم الوقود (ر.س)</Label>
                    <Input
                      id="fuelCharge"
                      type="number"
                      disabled={autoFuelCharge}
                      value={formData.additionalCharges.fuelCharge}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        additionalCharges: { 
                          ...prev.additionalCharges, 
                          fuelCharge: parseFloat(e.target.value) || 0 
                        }
                      }))}
                    />
                    {formData.fuelLevel < 100 && (
                      <p className="text-xs text-orange-600 mt-1">
                        مستوى الوقود {formData.fuelLevel}%
                      </p>
                    )}
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
                  <Label htmlFor="otherDescription">رسوم الكيلومترات الزائدة - الوصف</Label>
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
                    placeholder="وصف الرسوم الأخرى (تلقائي: رسوم الكيلومترات الزائدة)"
                  />
                </div>

                <div>
                  <Label htmlFor="other">مبلغ الرسوم الأخرى (ر.س)</Label>
                  <Input
                    id="other"
                    type="number"
                    disabled={autoMileageCharge}
                    value={formData.additionalCharges.other}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      additionalCharges: { 
                        ...prev.additionalCharges, 
                        other: parseFloat(e.target.value) || 0 
                      }
                    }))}
                  />
                  {selectedContract && formData.currentMileage > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      المسافة المقطوعة: {(formData.currentMileage - selectedContract.startMileage).toLocaleString()} كم
                    </p>
                  )}
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
            onClick={currentStep === 1 ? () => onOpenChange(false) : prevStep}
            disabled={isGeneratingPDF}
          >
            <ArrowLeft className={`h-4 w-4 ${currentStep === 1 ? '' : 'ml-2'}`} />
            {currentStep === 1 ? 'إلغاء' : 'السابق'}
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={nextStep} className="bg-primary hover:bg-primary-hover">
              التالي
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {/* NEW: quick print */}
              <Button variant="outline" onClick={() => window.print()}>
                طباعة محضر الإرجاع
              </Button>

              {/* NEW: confirm before submit */}
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="bg-primary hover:bg-primary-hover relative"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جارٍ المعالجة...
                      </>
                    ) : (
                      'إنهاء الإرجاع'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertHeader>
                    <AlertDialogTitle>تأكيد إنهاء الإرجاع</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم إنهاء العقد وتحديث حالة المركبة إلى متاحة.
                      الرجاء تأكيد التفاصيل التالية:
                    </AlertDialogDescription>
                  </AlertHeader>

                  <div className="space-y-2 text-sm bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span>الرسوم الإضافية:</span>
                      <span className="font-bold">{calculateTotalCharges().toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span>قراءة العداد النهائية:</span>
                      <span className="font-bold">{formData.currentMileage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مستوى الوقود:</span>
                      <span className="font-bold">%{formData.fuelLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المفتش:</span>
                      <span className="font-bold">{formData.inspectorName || '-'}</span>
                    </div>
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isGeneratingPDF}>رجوع</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      disabled={isGeneratingPDF}
                      className="relative"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جارٍ الحفظ...
                        </>
                      ) : (
                        'تأكيد وإنهاء'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
      
      {/* Hidden return form for PDF generation */}
      {selectedContract && (
        <div id="return-form-preview" className="fixed -left-[9999px] top-0 w-[210mm] bg-white">
          <VehicleReturnForm 
            contract={{
              ...selectedContract,
              customers: { name: selectedContract.customerName },
              vehicles: { 
                brand: selectedContract.vehicleModel.split(' ')[0],
                model: selectedContract.vehicleModel.split(' ').slice(1).join(' '),
                plate_number: selectedContract.vehiclePlate 
              },
              odometer_end: formData.currentMileage,
              fuel_level_end: `${formData.fuelLevel}%`,
              mileage_start: selectedContract.startMileage,
            }}
            returnData={{
              mileageOut: formData.currentMileage,
              fuelLevelOut: `${formData.fuelLevel}%`,
              photos: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
              damagePoints: formData.damagePoints.length > 0 ? formData.damagePoints : undefined,
              damages: [],
              additionalCharges: {
                lateFee: formData.additionalCharges.lateFee,
                fuelFee: formData.additionalCharges.fuelCharge,
                cleaningFee: formData.additionalCharges.cleaningFee,
                mileageFee: formData.additionalCharges.other,
                other: 0,
              },
              notes: formData.returnNotes,
              distance: formData.currentMileage - selectedContract.startMileage,
              inspectorName: formData.inspectorName,
            }}
          />
        </div>
      )}
    </Dialog>
  );
}
