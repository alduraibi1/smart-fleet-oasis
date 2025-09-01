import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from './ProfileForm';
import { AvatarUpload } from './AvatarUpload';
import { UserRoles } from './UserRoles';
import { SecuritySettings } from './SecuritySettings';

export function ProfileSettings() {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">المعلومات الأساسية</TabsTrigger>
        <TabsTrigger value="avatar">الصورة الشخصية</TabsTrigger>
        <TabsTrigger value="roles">الأدوار والصلاحيات</TabsTrigger>
        <TabsTrigger value="security">الأمان</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الشخصية</CardTitle>
            <CardDescription>
              تحديث معلوماتك الشخصية وبيانات الاتصال
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="avatar">
        <Card>
          <CardHeader>
            <CardTitle>الصورة الشخصية</CardTitle>
            <CardDescription>
              تحديث صورتك الشخصية التي تظهر في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="roles">
        <Card>
          <CardHeader>
            <CardTitle>الأدوار والصلاحيات</CardTitle>
            <CardDescription>
              عرض الأدوار المخصصة لك والصلاحيات المتاحة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserRoles />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الأمان</CardTitle>
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
  );
}