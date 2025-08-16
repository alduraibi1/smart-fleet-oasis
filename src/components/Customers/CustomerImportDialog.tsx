
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface CustomerImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export const CustomerImportDialog: React.FC<CustomerImportDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        'الاسم *': 'أحمد محمد',
        'رقم الهاتف *': '0501234567',
        'البريد الإلكتروني': 'ahmed@example.com',
        'رقم الهوية *': '1234567890',
        'الجنسية': 'سعودي',
        'المدينة': 'الرياض',
        'العنوان': 'شارع الملك فهد',
        'رقم الرخصة': 'DL123456789',
        'تاريخ انتهاء الرخصة': '2025-12-31'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب العملاء');
    XLSX.writeFile(workbook, 'customer_template.xlsx');
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف للرفع",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let successCount = 0;
          let errorCount = 0;

          for (const row of jsonData) {
            try {
              const customerData = {
                name: (row as any)['الاسم *'] || (row as any)['name'],
                phone: (row as any)['رقم الهاتف *'] || (row as any)['phone'],
                email: (row as any)['البريد الإلكتروني'] || (row as any)['email'] || null,
                national_id: (row as any)['رقم الهوية *'] || (row as any)['national_id'],
                nationality: (row as any)['الجنسية'] || (row as any)['nationality'] || 'سعودي',
                city: (row as any)['المدينة'] || (row as any)['city'] || null,
                address: (row as any)['العنوان'] || (row as any)['address'] || null,
                license_number: (row as any)['رقم الرخصة'] || (row as any)['license_number'] || null,
                license_expiry: (row as any)['تاريخ انتهاء الرخصة'] || (row as any)['license_expiry'] || null,
                is_active: true,
                blacklisted: false,
                gender: 'male',
                marital_status: 'single',
                license_type: 'private',
                international_license: false,
                country: 'السعودية',
                address_type: 'residential',
                preferred_language: 'ar',
                marketing_consent: false,
                sms_notifications: true,
                email_notifications: true,
                customer_source: 'import',
                rating: 5
              };

              if (!customerData.name || !customerData.phone || !customerData.national_id) {
                errorCount++;
                continue;
              }

              const { error } = await supabase
                .from('customers')
                .insert(customerData);

              if (error) {
                console.error('Error inserting customer:', error);
                errorCount++;
              } else {
                successCount++;
              }
            } catch (error) {
              console.error('Error processing row:', error);
              errorCount++;
            }
          }

          toast({
            title: "تم الاستيراد",
            description: `تم استيراد ${successCount} عميل بنجاح. فشل في ${errorCount} عميل.`
          });

          if (successCount > 0) {
            onImportComplete();
            onOpenChange(false);
          }
        } catch (error) {
          console.error('Error reading file:', error);
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء قراءة الملف",
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفع الملف",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            استيراد العملاء
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file">اختر ملف Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex-1"
            >
              <Download className="h-4 w-4 ml-2" />
              تحميل القالب
            </Button>
            <Button
              onClick={handleFileUpload}
              disabled={!file || isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 ml-2" />
              {isUploading ? 'جارِ الرفع...' : 'رفع الملف'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>ملاحظات:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>الحقول المطلوبة: الاسم، رقم الهاتف، رقم الهوية</li>
              <li>تنسيق التاريخ: YYYY-MM-DD</li>
              <li>يجب أن يكون الملف بصيغة Excel (.xlsx أو .xls)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
