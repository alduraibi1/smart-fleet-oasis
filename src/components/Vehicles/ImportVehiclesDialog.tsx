
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface ImportVehiclesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehiclesImported: () => void;
}

interface VehicleImportData {
  // Basic fields
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  
  // Technical details
  vin?: string;
  chassis_number?: string;
  engine_number?: string;
  fuel_type?: string;
  transmission?: string;
  seating_capacity?: number;
  daily_rate?: number;
  mileage?: number;
  status?: string;
  
  // Elm specific fields
  registration_type?: string;
  owner_name?: string;
  inspection_expiry?: string;
  inspection_status?: string;
  insurance_status?: string;
  insurance_expiry?: string;
  renewal_fees?: number;
  renewal_status?: string;
  registration_expiry?: string;
  
  // Legacy fields
  tracker_id?: string;
  owner_phone?: string;
  insurance_company?: string;
  insurance_policy?: string;
  insurance_start?: string;
  insurance_end?: string;
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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<VehicleImportData[]>([]);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
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
      tracker_id: mappedRow.tracker_id,
      fuel_type: mappedRow.fuel_type,
      transmission: mappedRow.transmission,
      seating_capacity: parseInt(mappedRow.seating_capacity),
      mileage: parseInt(mappedRow.mileage),
      engine_number: mappedRow.engine_number
    };
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const mappedData: VehicleImportData[] = jsonData.map((row: any) => mapRowData(row));
        setPreviewData(mappedData.slice(0, 5));
      } catch (error) {
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
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let successCount = 0;
          let errorCount = 0;
          const errors: string[] = [];

          for (const row of jsonData) {
            try {
              const vehicleData: VehicleImportData = {
                plate_number: row['رقم اللوحة'] || row['plate_number'] || '',
                brand: row['الماركة'] || row['brand'] || '',
                model: row['الموديل'] || row['model'] || '',
                year: parseInt(row['السنة'] || row['year']) || new Date().getFullYear(),
                color: row['اللون'] || row['color'] || '',
                tracker_id: row['معرف الجهاز'] || row['tracker_id'] || '',
                daily_rate: parseFloat(row['السعر اليومي'] || row['daily_rate']) || 0,
                owner_name: row['اسم المالك'] || row['owner_name'] || '',
                owner_phone: row['هاتف المالك'] || row['owner_phone'] || '',
                insurance_company: row['شركة التأمين'] || row['insurance_company'] || '',
                insurance_policy: row['رقم الوثيقة'] || row['insurance_policy'] || '',
                insurance_start: row['تاريخ بداية التأمين'] || row['insurance_start'] || '',
                insurance_end: row['تاريخ انتهاء التأمين'] || row['insurance_end'] || ''
              };

              // التحقق من البيانات المطلوبة
              if (!vehicleData.plate_number || !vehicleData.brand || !vehicleData.model) {
                errors.push(`صف ${jsonData.indexOf(row) + 1}: بيانات ناقصة`);
                errorCount++;
                continue;
              }

              // Parse dates from Excel or string format
              const parseDate = (dateStr: any) => {
                if (!dateStr) return null;
                try {
                  // Handle Excel date format (number)
                  if (typeof dateStr === 'number') {
                    const date = new Date((dateStr - 25569) * 86400 * 1000);
                    return date.toISOString().split('T')[0];
                  }
                  // Handle string dates
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
              
              // Import to database (enabled!)
              const { error } = await supabase
                .from('vehicles')
                .insert({
                  plate_number: vehicleData.plate_number,
                  brand: vehicleData.brand,
                  model: vehicleData.model,
                  year: vehicleData.year,
                  color: vehicleData.color,
                  vin: vehicleData.vin,
                  chassis_number: vehicleData.chassis_number,
                  fuel_type: vehicleData.fuel_type || 'gasoline',
                  transmission: vehicleData.transmission || 'automatic',
                  seating_capacity: parseInt(vehicleData.seating_capacity?.toString() || '5'),
                  daily_rate: vehicleData.daily_rate || 0,
                  mileage: parseInt(vehicleData.mileage?.toString() || '0'),
                  status: mapStatus(vehicleData.status || 'available'),
                  // Elm specific fields
                  registration_type: vehicleData.registration_type,
                  inspection_expiry: parseDate(vehicleData.inspection_expiry),
                  inspection_status: mapValidityStatus(vehicleData.inspection_status || 'valid'),
                  insurance_status: mapValidityStatus(vehicleData.insurance_status || 'valid'),
                  insurance_expiry: parseDate(vehicleData.insurance_expiry),
                  renewal_fees: vehicleData.renewal_fees || 0,
                  renewal_status: vehicleData.renewal_status,
                  registration_expiry: parseDate(vehicleData.registration_expiry)
                });
              
              if (error) {
                throw new Error(error.message);
              }
              
              successCount++;
            } catch (error) {
              errorCount++;
              errors.push(`صف ${jsonData.indexOf(row) + 1}: ${error.message}`);
            }
          }

          toast({
            title: "اكتملت عملية الاستيراد",
            description: `تم استيراد ${successCount} مركبة بنجاح، ${errorCount} أخطاء`,
            variant: successCount > 0 ? "default" : "destructive"
          });

          if (successCount > 0) {
            onVehiclesImported();
            onOpenChange(false);
          }

        } catch (error) {
          toast({
            title: "خطأ في الاستيراد",
            description: "حدث خطأ أثناء معالجة البيانات",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setLoading(false);
      toast({
        title: "خطأ في الملف",
        description: "تأكد من صحة الملف المحدد",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>استيراد المركبات من ملف Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              يمكنك تحميل قالب Excel لمعرفة التنسيق المطلوب للبيانات
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={downloadTemplate} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل القالب
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excel-file">اختر ملف Excel</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
            />
          </div>

          {previewData.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">معاينة البيانات (أول 5 صفوف):</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2">رقم اللوحة</th>
                      <th className="border p-2">نوع التسجيل</th>
                      <th className="border p-2">الماركة</th>
                      <th className="border p-2">الطراز</th>
                      <th className="border p-2">السنة</th>
                      <th className="border p-2">حالة الفحص</th>
                      <th className="border p-2">حالة التأمين</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{item.plate_number}</td>
                        <td className="border p-2">{item.registration_type || '-'}</td>
                        <td className="border p-2">{item.brand}</td>
                        <td className="border p-2">{item.model}</td>
                        <td className="border p-2">{item.year}</td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.inspection_status === 'صالح' || item.inspection_status === 'valid' 
                              ? 'bg-green-100 text-green-800' 
                              : item.inspection_status === 'منتهي' || item.inspection_status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.inspection_status || '-'}
                          </span>
                        </td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.insurance_status === 'صالح' || item.insurance_status === 'valid' 
                              ? 'bg-green-100 text-green-800' 
                              : item.insurance_status === 'منتهي' || item.insurance_status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.insurance_status || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || loading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? "جاري الاستيراد..." : "استيراد"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportVehiclesDialog;
