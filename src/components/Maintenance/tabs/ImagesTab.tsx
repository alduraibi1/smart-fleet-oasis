import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  X, 
  Eye, 
  Download,
  FileImage,
  ImagePlus
} from "lucide-react";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface ImagesTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData | ((prev: MaintenanceFormData) => MaintenanceFormData)) => void;
}

export function ImagesTab({ formData, setFormData }: ImagesTabProps) {
  const [beforeImagePreview, setBeforeImagePreview] = useState<string[]>([]);
  const [afterImagePreview, setAfterImagePreview] = useState<string[]>([]);

  const handleInputChange = (field: keyof MaintenanceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBeforeImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        newPreviews.push(result);
        
        if (index === files.length - 1) {
          setFormData(prev => ({ 
            ...prev, 
            beforeImages: [...prev.beforeImages, ...newImages] 
          }));
          setBeforeImagePreview(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAfterImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        newPreviews.push(result);
        
        if (index === files.length - 1) {
          setFormData(prev => ({ 
            ...prev, 
            afterImages: [...prev.afterImages, ...newImages] 
          }));
          setAfterImagePreview(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeBeforeImage = (index: number) => {
    const updatedImages = formData.beforeImages.filter((_, i) => i !== index);
    const updatedPreviews = beforeImagePreview.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, beforeImages: updatedImages }));
    setBeforeImagePreview(updatedPreviews);
  };

  const removeAfterImage = (index: number) => {
    const updatedImages = formData.afterImages.filter((_, i) => i !== index);
    const updatedPreviews = afterImagePreview.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, afterImages: updatedImages }));
    setAfterImagePreview(updatedPreviews);
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Condition Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            تقييم حالة المركبة
          </CardTitle>
          <CardDescription>
            وصف تفصيلي لحالة المركبة قبل وبعد الصيانة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>حالة المركبة قبل الصيانة</Label>
              <Textarea
                placeholder="اكتب وصف تفصيلي لحالة المركبة قبل البدء في أعمال الصيانة..."
                value={formData.vehicleConditionBefore}
                onChange={(e) => handleInputChange("vehicleConditionBefore", e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>حالة المركبة بعد الصيانة</Label>
              <Textarea
                placeholder="اكتب وصف تفصيلي لحالة المركبة بعد انتهاء أعمال الصيانة..."
                value={formData.vehicleConditionAfter}
                onChange={(e) => handleInputChange("vehicleConditionAfter", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Before Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            صور قبل الصيانة
          </CardTitle>
          <CardDescription>
            التقط صور توضح حالة المركبة والمشاكل قبل البدء في الصيانة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="mt-4">
                  <Button variant="outline" className="relative">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    اختر صور قبل الصيانة
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBeforeImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  يمكنك اختيار عدة صور في نفس الوقت
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {beforeImagePreview.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{beforeImagePreview.length} صورة</Badge>
                  <span className="text-sm text-muted-foreground">صور قبل الصيانة</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {beforeImagePreview.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={image}
                          alt={`قبل الصيانة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Image Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeBeforeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* After Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            صور بعد الصيانة
          </CardTitle>
          <CardDescription>
            التقط صور توضح النتائج النهائية بعد انتهاء أعمال الصيانة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="mt-4">
                  <Button variant="outline" className="relative">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    اختر صور بعد الصيانة
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAfterImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  يمكنك اختيار عدة صور في نفس الوقت
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {afterImagePreview.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{afterImagePreview.length} صورة</Badge>
                  <span className="text-sm text-muted-foreground">صور بعد الصيانة</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {afterImagePreview.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={image}
                          alt={`بعد الصيانة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Image Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removeAfterImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {(beforeImagePreview.length > 0 || afterImagePreview.length > 0) && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{beforeImagePreview.length}</div>
                <div className="text-sm text-muted-foreground">صور قبل الصيانة</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{afterImagePreview.length}</div>
                <div className="text-sm text-muted-foreground">صور بعد الصيانة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}