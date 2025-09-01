import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bell, ExternalLink } from 'lucide-react';

export function NotificationSettings() {
  const navigate = useNavigate();

  const goToNotifications = () => {
    navigate('/notifications');
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">إعدادات الإشعارات</h3>
        <p className="text-muted-foreground mb-6">
          يمكنك إدارة جميع إعدادات الإشعارات والتنبيهات من الصفحة المخصصة
        </p>
        <Button onClick={goToNotifications} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          الانتقال إلى إعدادات الإشعارات
        </Button>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">إعدادات سريعة</h4>
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium">إشعارات النظام</h5>
            <p className="text-sm text-muted-foreground mt-1">
              التنبيهات المهمة حول حالة النظام والأخطاء
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium">إشعارات العقود</h5>
            <p className="text-sm text-muted-foreground mt-1">
              تنبيهات انتهاء العقود والتجديدات المطلوبة
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium">إشعارات الصيانة</h5>
            <p className="text-sm text-muted-foreground mt-1">
              تذكيرات مواعيد الصيانة والفحوصات الدورية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}