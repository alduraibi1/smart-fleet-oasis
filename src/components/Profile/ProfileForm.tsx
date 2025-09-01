import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2 } from 'lucide-react';

export function ProfileForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    phone: userProfile?.phone || '',
    email: user?.email || '',
  });

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">الاسم الكامل</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="أدخل اسمك الكامل"
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
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            value={formData.email}
            disabled
            className="bg-muted"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            لا يمكن تغيير البريد الإلكتروني، تواصل مع الإدارة إذا كنت بحاجة لتحديثه
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>
    </form>
  );
}