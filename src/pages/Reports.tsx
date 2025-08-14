
import { ReportsOverview } from "@/components/Reports/ReportsOverview";
import { AppLayout } from "@/components/Layout/AppLayout";

const Reports = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
          <p className="text-muted-foreground mt-2">
            مركز التقارير الشامل لجميع أقسام النظام
          </p>
        </div>
        <ReportsOverview />
      </div>
    </AppLayout>
  );
};

export default Reports;
