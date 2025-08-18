
import { EnhancedStats } from '@/components/Dashboard/EnhancedStats';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { AppLayout } from '@/components/Layout/AppLayout';

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="section-spacing">
        {/* العنوان الرئيسي */}
        <div className="content-spacing max-w-none">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="heading-responsive">لوحة التحكم</h1>
            <p className="subheading-responsive">
              نظرة شاملة على حالة النظام والإحصائيات المالية
            </p>
          </div>

          {/* الإحصائيات المحسنة */}
          <div className="mb-6">
            <EnhancedStats />
          </div>

          {/* الإجراءات السريعة */}
          <div className="layout-stack">
            <div className="layout-main">
              <QuickActions />
            </div>
            <div className="layout-sidebar">
              {/* يمكن إضافة مكونات إضافية هنا لاحقاً */}
              <div className="dashboard-card">
                <h3 className="font-semibold text-sm mb-3">التنبيهات السريعة</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>لا توجد تنبيهات جديدة</p>
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
