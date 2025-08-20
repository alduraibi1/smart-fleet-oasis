
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useNationalities, NationalityFormData } from '@/hooks/useNationalities';

interface AddNationalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddNationalityDialog = ({ open, onOpenChange, onSuccess }: AddNationalityDialogProps) => {
  const { addNationality } = useNationalities();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NationalityFormData>({
    code: '',
    name_ar: '',
    name_en: '',
    id_prefix: '',
    id_length: 10,
    id_validation_regex: '',
    is_active: true,
    priority: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name_ar.trim()) {
      return;
    }

    setLoading(true);
    
    const result = await addNationality(formData);
    
    if (result.success) {
      setFormData({
        code: '',
        name_ar: '',
        name_en: '',
        id_prefix: '',
        id_length: 10,
        id_validation_regex: '',
        is_active: true,
        priority: 100
      });
      onSuccess();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة جنسية جديدة</DialogTitle>
          <DialogDescription>
            أضف الجنسيات المتاحة للعملاء في النظام
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">الكود *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SA"
                required
              />
            </div>
            <div>
              <Label htmlFor="priority">الأولوية</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
                min="1"
                max="999"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name_ar">الاسم بالعربية *</Label>
            <Input
              id="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder="سعودي"
              required
            />
          </div>

          <div>
            <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Saudi"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_prefix">بادئة الهوية</Label>
              <Input
                id="id_prefix"
                value={formData.id_prefix}
                onChange={(e) => setFormData({ ...formData, id_prefix: e.target.value })}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="id_length">طول الهوية</Label>
              <Input
                id="id_length"
                type="number"
                value={formData.id_length}
                onChange={(e) => setFormData({ ...formData, id_length: parseInt(e.target.value) || 10 })}
                min="8"
                max="15"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="id_validation_regex">نمط التحقق (Regex)</Label>
            <Input
              id="id_validation_regex"
              value={formData.id_validation_regex}
              onChange={(e) => setFormData({ ...formData, id_validation_regex: e.target.value })}
              placeholder="^1\d{9}$"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">نشط</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'جاري الحفظ...' : 'إضافة الجنسية'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
