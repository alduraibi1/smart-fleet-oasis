import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from './ProfileForm';
import { AvatarUpload } from './AvatarUpload';
import { UserRoles } from './UserRoles';
import { SecuritySettings } from './SecuritySettings';
import { User, Camera, Shield, Lock } from 'lucide-react';

export function ProfileSettings() {
  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="transition-all hover-scale">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="avatar" className="transition-all hover-scale">الصورة الشخصية</TabsTrigger>
          <TabsTrigger value="roles" className="transition-all hover-scale">الأدوار والصلاحيات</TabsTrigger>
          <TabsTrigger value="security" className="transition-all hover-scale">الأمان</TabsTrigger>
        </TabsList>
      
      <TabsContent value="profile" className="animate-fade-in">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الشخصية
            </CardTitle>
            <CardDescription>
              تحديث معلوماتك الشخصية وبيانات الاتصال
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="avatar" className="animate-fade-in">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              الصورة الشخصية
            </CardTitle>
            <CardDescription>
              تحديث صورتك الشخصية التي تظهر في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="roles" className="animate-fade-in">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              الأدوار والصلاحيات
            </CardTitle>
            <CardDescription>
              عرض الأدوار المخصصة لك والصلاحيات المتاحة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserRoles />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security" className="animate-fade-in">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              إعدادات الأمان
            </CardTitle>
            <CardDescription>
              إدارة كلمة المرور وإعدادات الأمان للحساب
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SecuritySettings />
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
}