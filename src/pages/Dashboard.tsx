
import { EnhancedStats } from '@/components/Dashboard/EnhancedStats';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { AppLayout } from '@/components/Layout/AppLayout';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="content-spacing">
        {/* العنوان الرئيسي */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex flex-col gap-1 sm:gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">لوحة التحكم</h1>
            <p className="text-adaptive text-muted-foreground">
              نظرة شاملة على حالة النظام والإحصائيات المالية
            </p>
          </div>

          {/* الإحصائيات المحسنة */}
          <div className="adaptive-grid">
            <EnhancedStats />
          </div>

          {/* الإجراءات السريعة والمحتوى الإضافي */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <div className="lg:col-span-2 xl:col-span-3 space-y-4 md:space-y-6">
              <QuickActions />
            </div>
            <div className="space-y-4">
              {/* التنبيهات السريعة */}
              <div className="dashboard-card">
                <h3 className="font-semibold text-adaptive-lg mb-3">التنبيهات السريعة</h3>
                <div className="space-y-2 text-adaptive text-muted-foreground">
                  <p>لا توجد تنبيهات جديدة</p>
                </div>
              </div>
              
              {/* إحصائيات سريعة إضافية */}
              <div className="dashboard-card">
                <h3 className="font-semibold text-adaptive-lg mb-3">نظرة سريعة</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-adaptive text-muted-foreground">المركبات النشطة</span>
                    <span className="font-medium text-adaptive">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-adaptive text-muted-foreground">العقود اليوم</span>
                    <span className="font-medium text-adaptive">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-adaptive text-muted-foreground">الإيرادات اليوم</span>
                    <span className="font-medium text-adaptive text-success">2,450 ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
