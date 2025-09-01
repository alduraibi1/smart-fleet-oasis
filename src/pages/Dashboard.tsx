
import { EnhancedStats } from '@/components/Dashboard/EnhancedStats';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { AppLayout } from '@/components/Layout/AppLayout';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="content-spacing min-h-full">
        {/* العنوان الرئيسي */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              لوحة التحكم
            </h1>
            <p className="text-muted-foreground text-adaptive">
              نظرة شاملة على حالة النظام والإحصائيات المالية
            </p>
          </div>

          {/* الإحصائيات المحسنة */}
          <div className="adaptive-grid">
            <EnhancedStats />
          </div>

          {/* الإجراءات السريعة والمحتوى الإضافي */}
          <div className="responsive-grid-3 xl:grid-cols-4 items-start">
            <div className="lg:col-span-2 xl:col-span-3 space-y-4 md:space-y-6">
              <QuickActions />
            </div>
            <div className="space-y-4">
              {/* التنبيهات السريعة */}
              <div className="dashboard-card">
                <h3 className="font-semibold text-adaptive-lg mb-3 text-foreground">
                  التنبيهات السريعة
                </h3>
                <div className="space-y-2 text-adaptive text-muted-foreground">
                  <p>لا توجد تنبيهات جديدة</p>
                </div>
              </div>
              
              {/* إحصائيات سريعة إضافية */}
              <div className="dashboard-card">
                <h3 className="font-semibold text-adaptive-lg mb-3 text-foreground">
                  نظرة سريعة
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-adaptive text-muted-foreground">المركبات النشطة</span>
                    <span className="font-medium text-adaptive text-foreground">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-adaptive text-muted-foreground">العقود اليوم</span>
                    <span className="font-medium text-adaptive text-foreground">8</span>
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
