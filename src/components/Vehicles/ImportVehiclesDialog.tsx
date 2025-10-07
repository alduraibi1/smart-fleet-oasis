import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileCheck, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import ImportPreviewStep from './ImportSteps/ImportPreviewStep';
import ImportResultsStep from './ImportSteps/ImportResultsStep';
import {
  VehicleImportData,
  ValidationError,
  validateRequiredFields,
  checkExpiryWarnings,
  checkDuplicates,
  normalizePlateNumber,
  normalizeBrand,
  findOrCreateOwner
} from '@/utils/vehicleImportValidation';

interface ImportVehiclesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehiclesImported: () => void;
}

type ImportStep = 'upload' | 'preview' | 'import' | 'results';

interface ImportResult {
  success: number;
  failed: number;
  warnings: number;
  errors: Array<{
    row: number;
    plate: string;
    message: string;
  }>;
}

// Elm field mapping - يربط أسماء الأعمدة العربية بأسماء الحقول في قاعدة البيانات
const elmFieldMapping: Record<string, string> = {
  // Arabic column names from Elm
  'رقم اللوحة': 'plate_number',
  'نوع التسجيل': 'registration_type',
  'الماركة': 'brand',
  'الطراز': 'model',
  'المالك': 'owner_name',
  'سنة الصنع': 'year',
  'الرقم التسلسلي': 'vin',
  'رقم الهيكل': 'chassis_number',
  'اللون': 'color',
  'وضع المركبة': 'status',
  'تاريخ انتهاء الفحص': 'inspection_expiry',
  'حالة الفحص': 'inspection_status',
  'حالة التأمين': 'insurance_status',
  'تاريخ انتهاء التامين': 'insurance_expiry',
  'رسوم التجديد': 'renewal_fees',
  'حالة التجديد': 'renewal_status',
  'تاريخ انتهاء رخصة السير': 'registration_expiry',
  
  // English alternatives (for flexibility)
  'plate_number': 'plate_number',
  'registration_type': 'registration_type',
  'brand': 'brand',
  'model': 'model',
  'owner': 'owner_name',
  'owner_name': 'owner_name',
  'year': 'year',
  'vin': 'vin',
  'chassis_number': 'chassis_number',
  'color': 'color',
  'status': 'status',
  'inspection_expiry': 'inspection_expiry',
  'inspection_status': 'inspection_status',
  'insurance_status': 'insurance_status',
  'insurance_expiry': 'insurance_expiry',
  'renewal_fees': 'renewal_fees',
  'renewal_status': 'renewal_status',
  'registration_expiry': 'registration_expiry',
  
  // Legacy field support
  'الموديل': 'model',
  'السنة': 'year',
  'اسم المالك': 'owner_name',
  'تاريخ انتهاء التأمين': 'insurance_expiry'
};

const ImportVehiclesDialog: React.FC<ImportVehiclesDialogProps> = ({
  open,
  onOpenChange,
  onVehiclesImported
}) => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<VehicleImportData[]>([]);
  const [validationErrors, setValidationErrors] = useState<Map<number, ValidationError[]>>(new Map());
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    // Elm format template
    const templateData = [{
      'رقم اللوحة': 'ABC-1234',
      'نوع التسجيل': 'خاص',
      'الماركة': 'Toyota',
      'الطراز': 'Camry',
      'المالك': 'محمد أحمد',
      'سنة الصنع': 2023,
      'الرقم التسلسلي': 'VIN123456789',
      'رقم الهيكل': '123456789',
      'اللون': 'أبيض',
      'وضع المركبة': 'available',
      'تاريخ انتهاء الفحص': '2025-12-31',
      'حالة الفحص': 'صالح',
      'حالة التأمين': 'صالح',
      'تاريخ انتهاء التامين': '2025-12-31',
      'رسوم التجديد': 500,
      'حالة التجديد': 'مجدد',
      'تاريخ انتهاء رخصة السير': '2025-12-31'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب مركبات علم');
    XLSX.writeFile(wb, 'elm_vehicles_template.xlsx');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await previewFile(selectedFile);
    }
  };

  // Helper function to map field using elmFieldMapping
  const mapRowData = (row: any): VehicleImportData => {
    const mappedRow: any = {};
    
    // Map all fields using the elmFieldMapping
    Object.keys(row).forEach(key => {
      const normalizedKey = key.trim();
      const targetField = elmFieldMapping[normalizedKey];
      if (targetField) {
        mappedRow[targetField] = row[key];
      }
    });
    
    // Ensure required fields have defaults
    return {
      plate_number: mappedRow.plate_number || '',
      brand: mappedRow.brand || '',
      model: mappedRow.model || '',
      year: parseInt(mappedRow.year) || new Date().getFullYear(),
      color: mappedRow.color,
      vin: mappedRow.vin,
      chassis_number: mappedRow.chassis_number,
      status: mappedRow.status,
      registration_type: mappedRow.registration_type,
      owner_name: mappedRow.owner_name,
      inspection_expiry: mappedRow.inspection_expiry,
      inspection_status: mappedRow.inspection_status,
      insurance_status: mappedRow.insurance_status,
      insurance_expiry: mappedRow.insurance_expiry,
      renewal_fees: parseFloat(mappedRow.renewal_fees) || 0,
      renewal_status: mappedRow.renewal_status,
      registration_expiry: mappedRow.registration_expiry,
      daily_rate: parseFloat(mappedRow.daily_rate) || 0,
      fuel_type: mappedRow.fuel_type,
      transmission: mappedRow.transmission,
      seating_capacity: parseInt(mappedRow.seating_capacity),
      mileage: parseInt(mappedRow.mileage),
      engine_number: mappedRow.engine_number
    };
  };

  const previewFile = async (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const mappedData: VehicleImportData[] = jsonData.map((row: any) => mapRowData(row));
        
        // التحقق من صحة البيانات
        const errorsMap = new Map<number, ValidationError[]>();
        
        for (let i = 0; i < mappedData.length; i++) {
          const rowErrors: ValidationError[] = [];
          
          // التحقق من الحقول المطلوبة
          rowErrors.push(...validateRequiredFields(mappedData[i], i + 1));
          
          // التحقق من التواريخ المنتهية
          rowErrors.push(...checkExpiryWarnings(mappedData[i], i + 1));
          
          // التحقق من التكرار
          const duplicateErrors = await checkDuplicates(mappedData[i]);
          rowErrors.push(...duplicateErrors.map(e => ({ ...e, row: i + 1 })));
          
          if (rowErrors.length > 0) {
            errorsMap.set(i, rowErrors);
          }
        }
        
        setPreviewData(mappedData);
        setValidationErrors(errorsMap);
        setCurrentStep('preview');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast({
          title: "خطأ في قراءة الملف",
          description: "تأكد من أن الملف بصيغة Excel صحيحة",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    // التحقق من عدم وجود أخطاء حرجة
    const hasErrors = Array.from(validationErrors.values())
      .flat()
      .some(e => e.severity === 'error');
    
    if (hasErrors) {
      toast({
        title: "لا يمكن الاستيراد",
        description: "يجب تصحيح الأخطاء قبل المتابعة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCurrentStep('import');
    
    const results: ImportResult = {
      success: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };

    try {
      for (let i = 0; i < previewData.length; i++) {
        const vehicleData = previewData[i];
        
        // التحقق من وجود تحذيرات
        const rowErrors = validationErrors.get(i) || [];
        const hasWarnings = rowErrors.some(e => e.severity === 'warning');
        if (hasWarnings) {
          results.warnings++;
        }

        try {
          // تنسيق البيانات
          const normalizedPlate = normalizePlateNumber(vehicleData.plate_number);
          const normalizedBrand = normalizeBrand(vehicleData.brand);
          
          // معالجة المالك
          let ownerId: string | null = null;
          if (vehicleData.owner_name) {
            ownerId = await findOrCreateOwner(vehicleData.owner_name);
          }

          // Parse dates from Excel or string format
          const parseDate = (dateStr: any) => {
            if (!dateStr) return null;
            try {
              if (typeof dateStr === 'number') {
                const date = new Date((dateStr - 25569) * 86400 * 1000);
                return date.toISOString().split('T')[0];
              }
              const parsed = new Date(dateStr);
              if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().split('T')[0];
              }
              return null;
            } catch {
              return null;
            }
          };
          
          // Map status values
          const mapStatus = (status: string) => {
            const statusMap: Record<string, string> = {
              'متاح': 'available',
              'مؤجر': 'rented',
              'صيانة': 'maintenance',
              'خارج الخدمة': 'out_of_service'
            };
            return statusMap[status] || status || 'available';
          };
          
          // Map inspection/insurance status
          const mapValidityStatus = (status: string) => {
            const statusMap: Record<string, string> = {
              'صالح': 'valid',
              'منتهي': 'expired',
              'قريب الانتهاء': 'near_expiry'
            };
            return statusMap[status] || status || 'valid';
          };
          
          // Insert to database
          const { error } = await supabase
            .from('vehicles')
            .insert({
              plate_number: normalizedPlate,
              brand: normalizedBrand,
              model: vehicleData.model,
              year: vehicleData.year,
              color: vehicleData.color,
              vin: vehicleData.vin,
              chassis_number: vehicleData.chassis_number,
              engine_number: vehicleData.engine_number,
              fuel_type: vehicleData.fuel_type || 'gasoline',
              transmission: vehicleData.transmission || 'automatic',
              seating_capacity: vehicleData.seating_capacity || 5,
              daily_rate: vehicleData.daily_rate || 0,
              mileage: vehicleData.mileage || 0,
              status: mapStatus(vehicleData.status || 'available'),
              owner_id: ownerId,
              registration_type: vehicleData.registration_type,
              inspection_expiry: parseDate(vehicleData.inspection_expiry),
              inspection_status: mapValidityStatus(vehicleData.inspection_status || 'valid'),
              insurance_status: mapValidityStatus(vehicleData.insurance_status || 'valid'),
              insurance_expiry: parseDate(vehicleData.insurance_expiry),
              renewal_fees: vehicleData.renewal_fees || 0,
              renewal_status: vehicleData.renewal_status || 'active',
              registration_expiry: parseDate(vehicleData.registration_expiry)
            });
          
          if (error) {
            throw new Error(error.message);
          }
          
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            plate: vehicleData.plate_number,
            message: error.message || 'خطأ غير معروف'
          });
        }
      }

      setImportResults(results);
      setCurrentStep('results');
      setLoading(false);

      toast({
        title: "اكتملت عملية الاستيراد",
        description: `تم استيراد ${results.success} مركبة بنجاح، ${results.failed} فشل`,
        variant: results.success > 0 ? "default" : "destructive"
      });

      if (results.success > 0) {
        onVehiclesImported();
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء معالجة البيانات",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setFile(null);
    setPreviewData([]);
    setValidationErrors(new Map());
    setImportResults(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const hasValidationErrors = Array.from(validationErrors.values())
    .flat()
    .some(e => e.severity === 'error');

  const stepTitles = {
    upload: 'رفع الملف',
    preview: 'معاينة والتحقق',
    import: 'جاري الاستيراد...',
    results: 'النتائج'
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            استيراد المركبات من ملف Excel
            <span className="text-sm font-normal text-muted-foreground">
              - {stepTitles[currentStep]}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {(['upload', 'preview', 'import', 'results'] as ImportStep[]).map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === step 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : index < ['upload', 'preview', 'import', 'results'].indexOf(currentStep)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted bg-muted text-muted-foreground'
              }`}>
                {index < ['upload', 'preview', 'import', 'results'].indexOf(currentStep) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < ['upload', 'preview', 'import', 'results'].indexOf(currentStep)
                    ? 'bg-primary'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <>
              <div className="flex gap-4">
                <Button 
                  onClick={downloadTemplate} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  تحميل قالب علم
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excel-file">اختر ملف Excel</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  إلغاء
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Preview */}
          {currentStep === 'preview' && (
            <>
              <ImportPreviewStep 
                previewData={previewData}
                validationErrors={validationErrors}
                onDataUpdate={(index, updatedData) => {
                  const newPreviewData = [...previewData];
                  newPreviewData[index] = updatedData;
                  setPreviewData(newPreviewData);
                  toast({
                    title: "تم تحديث البيانات",
                    description: `تم تحديث بيانات الصف ${index + 1}`,
                  });
                }}
              />

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={handleReset}>
                  رجوع
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={hasValidationErrors || loading}
                  className="flex items-center gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  تأكيد الاستيراد ({previewData.length} مركبة)
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Importing */}
          {currentStep === 'import' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
              <p className="text-lg font-medium">جاري استيراد المركبات...</p>
              <p className="text-sm text-muted-foreground">الرجاء الانتظار</p>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 'results' && importResults && (
            <>
              <ImportResultsStep results={importResults} />

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={handleReset}>
                  استيراد ملف آخر
                </Button>
                <Button onClick={handleClose}>
                  إغلاق
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportVehiclesDialog;
