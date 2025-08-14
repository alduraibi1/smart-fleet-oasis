
import { AppLayout } from "@/components/Layout/AppLayout";
import { ComprehensiveReporting } from "@/components/Reports/ComprehensiveReporting";

const EnhancedReports = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">التقارير الشاملة</h1>
          <p className="text-muted-foreground mt-2">
            مركز التقارير المتقدم مع تحليلات شاملة وتصدير متعدد الصيغ
          </p>
        </div>
        <ComprehensiveReporting />
      </div>
    </AppLayout>
  );
};

export default EnhancedReports;
