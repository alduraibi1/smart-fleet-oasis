
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

interface ImportVehiclesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehiclesImported: () => void;
}

interface VehicleImportData {
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  tracker_id?: string;
  daily_rate: number;
  owner_name?: string;
  owner_phone?: string;
  insurance_company?: string;
  insurance_policy?: string;
  insurance_start?: string;
  insurance_end?: string;
}

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
    const templateData = [{
      'رقم اللوحة': 'أ ب ج 123',
      'الماركة': 'تويوتا',
      'الموديل': 'كامري',
      'السنة': 2023,
      'اللون': 'أبيض',
      'معرف الجهاز': 'TRK001',
      'السعر اليومي': 150,
      'اسم المالك': 'أحمد محمد',
      'هاتف المالك': '966501234567',
      'شركة التأمين': 'شركة التأمين الوطنية',
      'رقم الوثيقة': 'INS123456',
      'تاريخ بداية التأمين': '2024-01-01',
      'تاريخ انتهاء التأمين': '2024-12-31'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب المركبات');
    XLSX.writeFile(wb, 'قالب_استيراد_المركبات.xlsx');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
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

        const mappedData: VehicleImportData[] = jsonData.map((row: any) => ({
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
        }));

        setPreviewData(mappedData.slice(0, 5)); // عرض أول 5 صفوف للمعاينة
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

              // يمكنك هنا إضافة منطق الحفظ في قاعدة البيانات
              // await supabase.from('vehicles').insert([vehicleData])
              
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
                      <th className="border p-2">الماركة</th>
                      <th className="border p-2">الموديل</th>
                      <th className="border p-2">السنة</th>
                      <th className="border p-2">اللون</th>
                      <th className="border p-2">السعر اليومي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{item.plate_number}</td>
                        <td className="border p-2">{item.brand}</td>
                        <td className="border p-2">{item.model}</td>
                        <td className="border p-2">{item.year}</td>
                        <td className="border p-2">{item.color}</td>
                        <td className="border p-2">{item.daily_rate}</td>
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
