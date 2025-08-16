
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Save, Loader2 } from "lucide-react";

interface AddMaintenanceTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddMaintenanceTemplateDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: AddMaintenanceTemplateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    maintenance_type: "",
    estimated_duration_hours: "",
    estimated_cost: "",
    required_parts: [] as string[],
    checklist_items: [] as string[]
  });
  const [newPart, setNewPart] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const { toast } = useToast();

  const maintenanceTypes = [
    "دورية",
    "طارئة", 
    "وقائية",
    "إصلاحية",
    "فحص عام",
    "تغيير زيت",
    "فحص فرامل",
    "فحص إطارات",
    "صيانة تكييف",
    "فحص بطارية",
    "أخرى"
  ];

  const handleAddPart = () => {
    if (newPart.trim()) {
      setTemplateData(prev => ({
        ...prev,
        required_parts: [...prev.required_parts, newPart.trim()]
      }));
      setNewPart("");
    }
  };

  const handleRemovePart = (index: number) => {
    setTemplateData(prev => ({
      ...prev,
      required_parts: prev.required_parts.filter((_, i) => i !== index)
    }));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setTemplateData(prev => ({
        ...prev,
        checklist_items: [...prev.checklist_items, newChecklistItem.trim()]
      }));
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setTemplateData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateData.name.trim() || !templateData.maintenance_type) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم القالب ونوع الصيانة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        name: templateData.name.trim(),
        description: templateData.description.trim() || null,
        maintenance_type: templateData.maintenance_type,
        estimated_duration_hours: templateData.estimated_duration_hours ? 
          parseFloat(templateData.estimated_duration_hours) : null,
        estimated_cost: templateData.estimated_cost ? 
          parseFloat(templateData.estimated_cost) : null,
        required_parts: templateData.required_parts.length > 0 ? 
          templateData.required_parts : null,
        checklist_items: templateData.checklist_items.length > 0 ? 
          templateData.checklist_items : null,
        is_active: true
      };

      const { error } = await supabase
        .from('maintenance_templates')
        .insert([insertData]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء قالب الصيانة بنجاح",
      });

      // إعادة تعيين البيانات
      setTemplateData({
        name: "",
        description: "",
        maintenance_type: "",
        estimated_duration_hours: "",
        estimated_cost: "",
        required_parts: [],
        checklist_items: []
      });

      onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('خطأ في إنشاء قالب الصيانة:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء قالب الصيانة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء قالب صيانة جديد</DialogTitle>
          <DialogDescription>
            أنشئ قالب صيانة لاستخدامه في المستقبل
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">اسم القالب *</Label>
              <Input
                id="template-name"
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="مثال: صيانة دورية شهرية"
                required
              />
            </div>

            <div>
              <Label htmlFor="maintenance-type">نوع الصيانة *</Label>
              <Select
                value={templateData.maintenance_type}
                onValueChange={(value) => setTemplateData(prev => ({ ...prev, maintenance_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الصيانة" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={templateData.description}
              onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="وصف مفصل لقالب الصيانة..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">المدة المتوقعة (ساعة)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                value={templateData.estimated_duration_hours}
                onChange={(e) => setTemplateData(prev => ({ ...prev, estimated_duration_hours: e.target.value }))}
                placeholder="2.5"
              />
            </div>

            <div>
              <Label htmlFor="cost">التكلفة المتوقعة (ريال)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={templateData.estimated_cost}
                onChange={(e) => setTemplateData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                placeholder="500.00"
              />
            </div>
          </div>

          <div>
            <Label>القطع المطلوبة</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPart}
                onChange={(e) => setNewPart(e.target.value)}
                placeholder="اسم القطعة"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPart())}
              />
              <Button type="button" onClick={handleAddPart} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {templateData.required_parts.map((part, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {part}
                  <button
                    type="button"
                    onClick={() => handleRemovePart(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>قائمة المراجعة</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="عنصر في قائمة المراجعة"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
              />
              <Button type="button" onClick={handleAddChecklistItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {templateData.checklist_items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ القالب
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
