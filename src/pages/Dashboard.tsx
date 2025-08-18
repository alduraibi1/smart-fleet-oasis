
import { EnhancedStats } from '@/components/Dashboard/EnhancedStats';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { AppLayout } from '@/components/Layout/AppLayout';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* العنوان الرئيسي */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            نظرة شاملة على حالة النظام والإحصائيات المالية
          </p>
        </div>

        {/* الإحصائيات المحسنة */}
        <EnhancedStats />

        {/* الإجراءات السريعة والتنبيهات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          <div>
            {/* يمكن إضافة مكونات إضافية هنا لاحقاً */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
