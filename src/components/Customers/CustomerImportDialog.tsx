
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
        'تاريخ انتهاء الرخصة': '2025-12-31',
        'الجنس': 'male',
        'الحالة الاجتماعية': 'single',
        'تاريخ الميلاد': '1990-01-01',
        'نوع الرخصة': 'private',
        'الدولة': 'السعودية',
        'الحي': 'العليا',
        'الرمز البريدي': '12345',
        'نوع العنوان': 'residential',
        'اللغة المفضلة': 'ar',
        'مصدر العميل': 'website',
        'المسمى الوظيفي': 'مهندس',
        'الشركة': 'شركة ABC',
        'هاتف العمل': '0112345678',
        'الراتب الشهري': '10000',
        'اسم البنك': 'البنك الأهلي',
        'رقم الحساب': '1234567890',
        'الحد الائتماني': '50000',
        'شروط الدفع': 'immediate',
        'طريقة الدفع المفضلة': 'cash',
        'اسم جهة الاتصال الطارئ': 'فاطمة أحمد',
        'هاتف جهة الاتصال الطارئ': '0501234568',
        'صلة القرابة': 'زوجة',
        'لديه تأمين': 'false',
        'شركة التأمين': '',
        'رقم بوليصة التأمين': '',
        'تاريخ انتهاء التأمين': '',
        'ملاحظات': 'عميل مميز'
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
                license_number: (row as any)['رقم الرخصة'] || (row as any)['license_number'] || '',
                license_expiry: (row as any)['تاريخ انتهاء الرخصة'] || (row as any)['license_expiry'] || null,
                gender: (row as any)['الجنس'] || (row as any)['gender'] || 'male',
                marital_status: (row as any)['الحالة الاجتماعية'] || (row as any)['marital_status'] || 'single',
                date_of_birth: (row as any)['تاريخ الميلاد'] || (row as any)['date_of_birth'] || null,
                license_type: (row as any)['نوع الرخصة'] || (row as any)['license_type'] || 'private',
                country: (row as any)['الدولة'] || (row as any)['country'] || 'السعودية',
                district: (row as any)['الحي'] || (row as any)['district'] || null,
                postal_code: (row as any)['الرمز البريدي'] || (row as any)['postal_code'] || null,
                address_type: (row as any)['نوع العنوان'] || (row as any)['address_type'] || 'residential',
                preferred_language: (row as any)['اللغة المفضلة'] || (row as any)['preferred_language'] || 'ar',
                customer_source: (row as any)['مصدر العميل'] || (row as any)['customer_source'] || 'import',
                job_title: (row as any)['المسمى الوظيفي'] || (row as any)['job_title'] || null,
                company: (row as any)['الشركة'] || (row as any)['company'] || null,
                work_phone: (row as any)['هاتف العمل'] || (row as any)['work_phone'] || null,
                monthly_income: Number((row as any)['الراتب الشهري'] || (row as any)['monthly_income'] || 0),
                bank_name: (row as any)['اسم البنك'] || (row as any)['bank_name'] || null,
                bank_account_number: (row as any)['رقم الحساب'] || (row as any)['bank_account_number'] || null,
                credit_limit: Number((row as any)['الحد الائتماني'] || (row as any)['credit_limit'] || 0),
                payment_terms: (row as any)['شروط الدفع'] || (row as any)['payment_terms'] || 'immediate',
                preferred_payment_method: (row as any)['طريقة الدفع المفضلة'] || (row as any)['preferred_payment_method'] || 'cash',
                emergency_contact_name: (row as any)['اسم جهة الاتصال الطارئ'] || (row as any)['emergency_contact_name'] || null,
                emergency_contact_phone: (row as any)['هاتف جهة الاتصال الطارئ'] || (row as any)['emergency_contact_phone'] || null,
                emergency_contact_relation: (row as any)['صلة القرابة'] || (row as any)['emergency_contact_relation'] || null,
                has_insurance: ((row as any)['لديه تأمين'] || (row as any)['has_insurance'] || 'false').toString() === 'true',
                insurance_company: (row as any)['شركة التأمين'] || (row as any)['insurance_company'] || null,
                insurance_policy_number: (row as any)['رقم بوليصة التأمين'] || (row as any)['insurance_policy_number'] || null,
                insurance_expiry: (row as any)['تاريخ انتهاء التأمين'] || (row as any)['insurance_expiry'] || null,
                notes: (row as any)['ملاحظات'] || (row as any)['notes'] || null,
                is_active: true,
                blacklisted: false,
                international_license: false,
                marketing_consent: false,
                sms_notifications: true,
                email_notifications: true,
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
