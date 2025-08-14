
import { AppLayout } from "@/components/Layout/AppLayout";
import { EnhancedDashboard as DashboardComponent } from "@/components/Dashboard/EnhancedDashboard";

const EnhancedDashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم المتقدمة</h1>
          <p className="text-muted-foreground mt-2">
            نظرة شاملة على الأداء والإحصائيات التفاعلية
          </p>
        </div>
        <DashboardComponent />
      </div>
    </AppLayout>
  );
};

export default EnhancedDashboard;
