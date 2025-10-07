import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadSectionProps {
  vehicleId?: string;
  onImagesChange: (images: File[]) => void;
}

export const ImageUploadSection = ({ vehicleId, onImagesChange }: ImageUploadSectionProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // التحقق من الحد الأقصى للصور
    if (files.length + selectedImages.length > 10) {
      toast({
        title: "تنبيه",
        description: "يمكنك رفع 10 صور كحد أقصى",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الصور (5MB لكل صورة)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "خطأ",
        description: "بعض الصور تتجاوز الحد الأقصى للحجم (5MB)",
        variant: "destructive",
      });
      return;
    }

    // إنشاء معاينات للصور
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    onImagesChange([...selectedImages, ...files]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Image className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">صور المركبة</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicle-images" className="cursor-pointer">
          <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">اضغط لرفع الصور</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP حتى 5MB (10 صور كحد أقصى)
              </p>
            </div>
          </div>
        </Label>
        <Input
          id="vehicle-images"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`معاينة ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {selectedImages.length > 0 && (
        <p className="text-sm text-muted-foreground">
          تم اختيار {selectedImages.length} صورة
        </p>
      )}
    </div>
  );
};
