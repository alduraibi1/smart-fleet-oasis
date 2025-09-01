import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Upload, User, Trash2 } from 'lucide-react';

export function AvatarUpload() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const getUserInitials = () => {
    const email = user?.email || '';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // في التطبيق الحقيقي، سيتم رفع الملف إلى Supabase Storage
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-2xl bg-primary/10">
            {avatarUrl ? null : <User className="h-16 w-16" />}
            {!avatarUrl && getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-2 space-x-reverse">
          <Label htmlFor="avatar-upload" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="ml-2 h-4 w-4" />
                رفع صورة جديدة
              </span>
            </Button>
          </Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          {avatarUrl && (
            <Button variant="outline" onClick={handleRemoveAvatar}>
              <Trash2 className="ml-2 h-4 w-4" />
              حذف الصورة
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            يُفضل استخدام صور بحجم 400x400 بكسل
          </p>
          <p className="text-xs text-muted-foreground">
            الحد الأقصى لحجم الملف: 2 ميجابايت
          </p>
        </div>
      </div>
    </div>
  );
}