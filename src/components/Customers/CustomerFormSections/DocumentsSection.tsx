
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerFormData } from '@/types/customer';
import { Upload, FileText, Calendar } from 'lucide-react';

interface DocumentsSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function DocumentsSection({ formData, onInputChange }: DocumentsSectionProps) {
  const handleFileUpload = (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      // For now, we'll just store the file name
      onInputChange(`${documentType}_document` as keyof CustomerFormData, file.name);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">مستندات العميل</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver License Document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              رخصة القيادة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="license_document">صورة الرخصة</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="license_document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload('license', e)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('license_document')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  رفع الملف
                </Button>
                {formData.license_document && (
                  <span className="text-sm text-muted-foreground">
                    {formData.license_document}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="license_expiry_document">تاريخ انتهاء الرخصة</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="license_expiry_document"
                  type="date"
                  value={formData.license_expiry || ''}
                  onChange={(e) => onInputChange('license_expiry', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residence Document (Iqama) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              الإقامة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="residence_document">صورة الإقامة</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="residence_document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload('residence', e)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('residence_document')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  رفع الملف
                </Button>
                {formData.residence_document && (
                  <span className="text-sm text-muted-foreground">
                    {formData.residence_document}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="residence_expiry">تاريخ انتهاء الإقامة</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="residence_expiry"
                  type="date"
                  value={formData.residence_expiry || ''}
                  onChange={(e) => onInputChange('residence_expiry', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* National ID Document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              الهوية الوطنية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="national_id_document">صورة الهوية</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="national_id_document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload('national_id', e)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('national_id_document')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  رفع الملف
                </Button>
                {formData.national_id_document && (
                  <span className="text-sm text-muted-foreground">
                    {formData.national_id_document}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passport Document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              جواز السفر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="passport_document">صورة جواز السفر</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="passport_document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload('passport', e)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('passport_document')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  رفع الملف
                </Button>
                {formData.passport_document && (
                  <span className="text-sm text-muted-foreground">
                    {formData.passport_document}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="passport_expiry">تاريخ انتهاء الجواز</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="passport_expiry"
                  type="date"
                  value={formData.passport_expiry || ''}
                  onChange={(e) => onInputChange('passport_expiry', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
