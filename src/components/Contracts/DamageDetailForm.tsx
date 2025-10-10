import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UnifiedDamage,
  DamageType,
  RepairMethod,
  RepairUrgency,
  DamageSeverity,
  damageTypeLabels,
  repairMethodLabels,
  repairUrgencyLabels,
  severityLabels,
} from '@/types/damage';

interface DamageDetailFormProps {
  damage: UnifiedDamage;
  onUpdate: (damage: UnifiedDamage) => void;
  onPhotoUpload: (files: File[]) => void;
  onPhotoRemove: (index: number) => void;
}

const commonDamageLocations = [
  'الباب الأمامي الأيمن',
  'الباب الأمامي الأيسر',
  'الباب الخلفي الأيمن',
  'الباب الخلفي الأيسر',
  'الصادم الأمامي',
  'الصادم الخلفي',
  'غطاء المحرك',
  'صندوق الأمتعة',
  'المرآة الجانبية اليمنى',
  'المرآة الجانبية اليسرى',
  'الزجاج الأمامي',
  'الزجاج الخلفي',
  'الإطار الأمامي الأيمن',
  'الإطار الأمامي الأيسر',
  'الإطار الخلفي الأيمن',
  'الإطار الخلفي الأيسر',
  'المقاعد الأمامية',
  'المقاعد الخلفية',
  'لوحة القيادة',
  'السقف',
  'أخرى',
];

export default function DamageDetailForm({
  damage,
  onUpdate,
  onPhotoUpload,
  onPhotoRemove,
}: DamageDetailFormProps) {
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const handleFieldChange = (field: keyof UnifiedDamage, value: any) => {
    onUpdate({ ...damage, [field]: value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPhotoFiles(files);
      onPhotoUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* الموقع والشدة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`location-${damage.id}`}>الموقع</Label>
          <Select
            value={damage.location}
            onValueChange={(value) => handleFieldChange('location', value)}
          >
            <SelectTrigger id={`location-${damage.id}`}>
              <SelectValue placeholder="اختر موقع الضرر" />
            </SelectTrigger>
            <SelectContent>
              {commonDamageLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`severity-${damage.id}`}>الخطورة</Label>
          <Select
            value={damage.severity}
            onValueChange={(value: DamageSeverity) =>
              handleFieldChange('severity', value)
            }
          >
            <SelectTrigger id={`severity-${damage.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(severityLabels).map(([key, { label, color }]) => (
                <SelectItem key={key} value={key}>
                  <span className={color}>{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* نوع الضرر وطريقة الإصلاح */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`damageType-${damage.id}`}>نوع الضرر</Label>
          <Select
            value={damage.damageType}
            onValueChange={(value: DamageType) =>
              handleFieldChange('damageType', value)
            }
          >
            <SelectTrigger id={`damageType-${damage.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(damageTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`repairMethod-${damage.id}`}>طريقة الإصلاح</Label>
          <Select
            value={damage.repairMethod}
            onValueChange={(value: RepairMethod) =>
              handleFieldChange('repairMethod', value)
            }
          >
            <SelectTrigger id={`repairMethod-${damage.id}`}>
              <SelectValue placeholder="اختر طريقة الإصلاح" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(repairMethodLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* الأولوية والتكلفة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`urgency-${damage.id}`}>أولوية الإصلاح</Label>
          <Select
            value={damage.repairUrgency}
            onValueChange={(value: RepairUrgency) =>
              handleFieldChange('repairUrgency', value)
            }
          >
            <SelectTrigger id={`urgency-${damage.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(repairUrgencyLabels).map(([key, { label, color }]) => (
                <SelectItem key={key} value={key}>
                  <span className={color}>{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`cost-${damage.id}`}>التكلفة المقدرة (ر.س)</Label>
          <Input
            id={`cost-${damage.id}`}
            type="number"
            min="0"
            step="0.01"
            value={damage.estimatedCost}
            onChange={(e) =>
              handleFieldChange('estimatedCost', parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      {/* الوصف */}
      <div>
        <Label htmlFor={`description-${damage.id}`}>وصف الضرر</Label>
        <Textarea
          id={`description-${damage.id}`}
          placeholder="اكتب وصفاً تفصيلياً للضرر..."
          value={damage.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          rows={3}
        />
      </div>

      {/* ملاحظات إضافية */}
      <div>
        <Label htmlFor={`notes-${damage.id}`}>ملاحظات إضافية</Label>
        <Textarea
          id={`notes-${damage.id}`}
          placeholder="أي ملاحظات أخرى..."
          value={damage.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          rows={2}
        />
      </div>

      {/* رفع الصور */}
      <div>
        <Label>صور الضرر</Label>
        <div className="mt-2 space-y-3">
          {/* عرض الصور الموجودة */}
          {damage.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {damage.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Damage ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => onPhotoRemove(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* زر رفع صور جديدة */}
          <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <label
              htmlFor={`photos-${damage.id}`}
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                انقر لرفع صور الضرر
              </span>
              <input
                id={`photos-${damage.id}`}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
