import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2, CheckCircle } from 'lucide-react';

export function ProfileForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    phone: userProfile?.phone || '',
    email: user?.email || '',
  });

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasUnsavedChanges]);

  const handleAutoSave = async () => {
    if (!user?.id || !hasUnsavedChanges) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
        });

      if (error) throw error;

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "تم الحفظ التلقائي",
        description: "تم حفظ تغييراتك تلقائياً",
        duration: 2000,
      });
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
        });

      if (error) throw error;

      toast({
        title: "تم حفظ التغييرات",
        description: "تم تحديث معلوماتك الشخصية بنجاح",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث المعلومات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      setHasUnsavedChanges(true);
      return newData;
    });
  };

  const getLastSavedText = () => {
    if (hasUnsavedChanges) {
      return 'لم يتم الحفظ';
    }
    if (lastSaved) {
      return `آخر حفظ: ${lastSaved.toLocaleTimeString('ar-SA')}`;
    }
    return '';
  };

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Auto-save status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <>
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">يتم الحفظ التلقائي...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">{getLastSavedText()}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">الحفظ التلقائي مفعل</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="أدخل رقم الهاتف"
              dir="ltr"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-muted transition-all duration-200"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              لا يمكن تغيير البريد الإلكتروني، تواصل مع الإدارة إذا كنت بحاجة لتحديثه
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !hasUnsavedChanges} className="hover-scale">
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ يدوي
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}