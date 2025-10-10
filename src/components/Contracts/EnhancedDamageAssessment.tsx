import { useState } from 'react';
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { VehicleDiagram, DamagePoint } from './VehicleDiagram';
import DamageDetailForm from './DamageDetailForm';
import {
  UnifiedDamage,
  VisualLocation,
  createEmptyDamage,
  getSeverityColor,
  severityLabels,
  damageTypeLabels,
  repairUrgencyLabels,
} from '@/types/damage';
import { uploadDamageImages } from '@/lib/supabase-storage';
import { useToast } from '@/hooks/use-toast';

interface EnhancedDamageAssessmentProps {
  damages: UnifiedDamage[];
  onChange: (damages: UnifiedDamage[]) => void;
  contractId?: string;
}

export default function EnhancedDamageAssessment({
  damages,
  onChange,
  contractId,
}: EnhancedDamageAssessmentProps) {
  const [selectedDamageId, setSelectedDamageId] = useState<string | null>(null);
  const [openDamageId, setOpenDamageId] = useState<string | null>(null);
  const { toast } = useToast();

  // إضافة ضرر جديد من الرسم التخطيطي
  const handleAddDamageFromDiagram = (damagePoint: Omit<DamagePoint, 'id'>) => {
    const newDamage: UnifiedDamage = {
      ...createEmptyDamage(),
      severity: damagePoint.severity,
      visualLocation: {
        view: damagePoint.view,
        x: damagePoint.x,
        y: damagePoint.y,
      },
    };
    onChange([...damages, newDamage]);
    setSelectedDamageId(newDamage.id);
    setOpenDamageId(newDamage.id);
  };

  // إضافة ضرر يدوياً
  const addDamage = () => {
    const newDamage = createEmptyDamage();
    onChange([...damages, newDamage]);
    setSelectedDamageId(newDamage.id);
    setOpenDamageId(newDamage.id);
  };

  // حذف ضرر
  const removeDamage = (id: string) => {
    onChange(damages.filter((d) => d.id !== id));
    if (selectedDamageId === id) {
      setSelectedDamageId(null);
    }
    if (openDamageId === id) {
      setOpenDamageId(null);
    }
  };

  // حذف نقطة من الرسم التخطيطي
  const handleRemoveDiagramPoint = (id: string) => {
    removeDamage(id);
  };

  // تحديث ضرر
  const updateDamage = (updatedDamage: UnifiedDamage) => {
    onChange(damages.map((d) => (d.id === updatedDamage.id ? updatedDamage : d)));
  };

  // رفع صور لضرر معين
  const handlePhotoUpload = async (damageId: string, files: File[]) => {
    if (!contractId) {
      toast({
        title: 'خطأ',
        description: 'لا يمكن رفع الصور بدون رقم عقد',
        variant: 'destructive',
      });
      return;
    }

    try {
      const urls = await uploadDamageImages(files, contractId, damageId);
      const damage = damages.find((d) => d.id === damageId);
      if (damage) {
        updateDamage({
          ...damage,
          photos: [...damage.photos, ...urls],
        });
      }
      toast({
        title: 'تم الرفع',
        description: `تم رفع ${files.length} صورة بنجاح`,
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفع الصور',
        variant: 'destructive',
      });
    }
  };

  // حذف صورة
  const handlePhotoRemove = (damageId: string, photoIndex: number) => {
    const damage = damages.find((d) => d.id === damageId);
    if (damage) {
      const newPhotos = damage.photos.filter((_, i) => i !== photoIndex);
      updateDamage({ ...damage, photos: newPhotos });
    }
  };

  // اختيار ضرر من القائمة
  const handleDamageSelect = (damageId: string) => {
    setSelectedDamageId(damageId);
    setOpenDamageId(damageId);
  };

  const totalCost = damages.reduce((sum, d) => sum + d.estimatedCost, 0);

  // تحويل UnifiedDamage إلى DamagePoint للرسم التخطيطي
  const diagramPoints = damages
    .filter((d) => d.visualLocation)
    .map((d) => ({
      id: d.id,
      view: d.visualLocation!.view,
      x: d.visualLocation!.x,
      y: d.visualLocation!.y,
      severity: d.severity,
      description: d.description,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            تقييم الأضرار المتقدم
          </span>
          <Button type="button" variant="outline" size="sm" onClick={addDamage}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة ضرر
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {damages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد أضرار مسجلة</p>
            <p className="text-sm">
              انقر على الرسم التخطيطي أو "إضافة ضرر" لتسجيل الأضرار
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الرسم التخطيطي */}
            <div className="order-2 lg:order-1">
              <h3 className="text-lg font-semibold mb-3">الرسم التخطيطي</h3>
              <VehicleDiagram
                damages={diagramPoints}
                onAddDamage={handleAddDamageFromDiagram}
                onRemoveDamage={handleRemoveDiagramPoint}
                interactive={true}
              />
            </div>

            {/* قائمة الأضرار */}
            <div className="order-1 lg:order-2 space-y-3">
              <h3 className="text-lg font-semibold">قائمة الأضرار التفصيلية</h3>
              {damages.map((damage, index) => (
                <Collapsible
                  key={damage.id}
                  open={openDamageId === damage.id}
                  onOpenChange={(open) =>
                    setOpenDamageId(open ? damage.id : null)
                  }
                >
                  <div
                    className={`border rounded-lg ${
                      selectedDamageId === damage.id
                        ? 'border-primary shadow-md'
                        : 'border-border'
                    }`}
                  >
                    <CollapsibleTrigger asChild>
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleDamageSelect(damage.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getSeverityColor(damage.severity) }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {damage.location || `ضرر #${index + 1}`}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{damageTypeLabels[damage.damageType]}</span>
                              <span>•</span>
                              <span className={severityLabels[damage.severity].color}>
                                {severityLabels[damage.severity].label}
                              </span>
                              {damage.estimatedCost > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{damage.estimatedCost.toFixed(2)} ر.س</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDamage(damage.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          {openDamageId === damage.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t p-4 bg-muted/30">
                        <DamageDetailForm
                          damage={damage}
                          onUpdate={updateDamage}
                          onPhotoUpload={(files) => handlePhotoUpload(damage.id, files)}
                          onPhotoRemove={(index) =>
                            handlePhotoRemove(damage.id, index)
                          }
                        />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </div>
        )}

        {/* الملخص المالي */}
        {damages.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">عدد الأضرار</div>
                <div className="text-2xl font-bold">{damages.length}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-muted-foreground">أضرار عاجلة</div>
                <div className="text-2xl font-bold text-red-600">
                  {damages.filter((d) => d.repairUrgency === 'immediate').length}
                </div>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <div className="text-muted-foreground">إجمالي التكلفة</div>
                <div className="text-2xl font-bold text-destructive">
                  {totalCost.toFixed(2)} ر.س
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
