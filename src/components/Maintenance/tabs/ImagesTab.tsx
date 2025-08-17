
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, X, Eye, Image as ImageIcon, AlertCircle } from "lucide-react";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface ImagesTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData) => void;
}

export function ImagesTab({ formData, setFormData }: ImagesTabProps) {
  const [uploading, setUploading] = useState(false);

  const handleBeforeImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // محاكاة رفع الصور - في التطبيق الحقيقي ستستخدم Supabase Storage
    setUploading(true);
    
    setTimeout(() => {
      const newImages = Array.from(files).map((file, index) => 
        `https://example.com/before-image-${Date.now()}-${index}.jpg`
      );
      
      setFormData({
        ...formData,
        beforeImages: [...formData.beforeImages, ...newImages]
      });
      
      setUploading(false);
    }, 1000);
  };

  const handleAfterImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    setTimeout(() => {
      const newImages = Array.from(files).map((file, index) => 
        `https://example.com/after-image-${Date.now()}-${index}.jpg`
      );
      
      setFormData({
        ...formData,
        afterImages: [...formData.afterImages, ...newImages]
      });
      
      setUploading(false);
    }, 1000);
  };

  const removeBeforeImage = (index: number) => {
    const updatedImages = formData.beforeImages.filter((_, i) => i !== index);
    setFormData({ ...formData, beforeImages: updatedImages });
  };

  const removeAfterImage = (index: number) => {
    const updatedImages = formData.afterImages.filter((_, i) => i !== index);
    setFormData({ ...formData, afterImages: updatedImages });
  };

  const handleVehicleConditionBeforeChange = (condition: string) => {
    setFormData({ ...formData, vehicleConditionBefore: condition });
  };

  const handleVehicleConditionAfterChange = (condition: string) => {
    setFormData({ ...formData, vehicleConditionAfter: condition });
  };

  return (
    <div className="space-y-6">
      {/* حالة المركبة قبل الصيانة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-4 w-4" />
            حالة المركبة قبل الصيانة
          </CardTitle>
          <CardDescription>
            وثق حالة المركبة قبل بدء أعمال الصيانة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleConditionBefore">وصف الحالة</Label>
            <Textarea
              id="vehicleConditionBefore"
              value={formData.vehicleConditionBefore}
              onChange={(e) => handleVehicleConditionBeforeChange(e.target.value)}
              placeholder="اكتب وصفاً تفصيلياً لحالة المركبة قبل الصيانة..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>صور ما قبل الصيانة ({formData.beforeImages.length})</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById('beforeImages')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'جاري الرفع...' : 'رفع صور'}
                </Button>
                <input
                  id="beforeImages"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleBeforeImageUpload}
                />
              </div>
            </div>

            {formData.beforeImages.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">لم يتم رفع أي صور بعد</p>
                <p className="text-sm text-muted-foreground">انقر على "رفع صور" لإضافة صور</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {formData.beforeImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`قبل الصيانة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(image, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeBeforeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* حالة المركبة بعد الصيانة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-4 w-4" />
            حالة المركبة بعد الصيانة
          </CardTitle>
          <CardDescription>
            وثق حالة المركبة بعد إنجاز أعمال الصيانة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleConditionAfter">وصف الحالة</Label>
            <Textarea
              id="vehicleConditionAfter"
              value={formData.vehicleConditionAfter}
              onChange={(e) => handleVehicleConditionAfterChange(e.target.value)}
              placeholder="اكتب وصفاً تفصيلياً لحالة المركبة بعد الصيانة..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>صور ما بعد الصيانة ({formData.afterImages.length})</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById('afterImages')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'جاري الرفع...' : 'رفع صور'}
                </Button>
                <input
                  id="afterImages"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAfterImageUpload}
                />
              </div>
            </div>

            {formData.afterImages.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">لم يتم رفع أي صور بعد</p>
                <p className="text-sm text-muted-foreground">انقر على "رفع صور" لإضافة صور</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {formData.afterImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`بعد الصيانة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(image, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAfterImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ملاحظة تنبيهية */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800">
                ملاحظة مهمة
              </p>
              <p className="text-sm text-amber-700">
                توثيق حالة المركبة بالصور والوصف يساعد في:
              </p>
              <ul className="text-sm text-amber-700 list-disc list-inside space-y-1 mt-2">
                <li>توضيح نطاق العمل المطلوب</li>
                <li>إثبات جودة العمل المنجز</li>
                <li>حماية قانونية في حالة النزاعات</li>
                <li>تحسين خدمة العملاء</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
