
import { AppLayout } from "@/components/Layout/AppLayout";
import { CompleteHRManagement } from "@/components/HR/CompleteHRManagement";

const EnhancedHR = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">إدارة الموارد البشرية المتقدمة</h1>
          <p className="text-muted-foreground mt-2">
            نظام شامل لإدارة الموظفين والرواتب والحضور والأداء
          </p>
        </div>
        <CompleteHRManagement />
      </div>
    </AppLayout>
  );
};

export default EnhancedHR;
