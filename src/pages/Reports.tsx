import { ReportsOverview } from "@/components/Reports/ReportsOverview";
import Header from "@/components/Layout/Header";

const Reports = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => {}} />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
          <p className="text-muted-foreground mt-2">
            مركز التقارير الشامل لجميع أقسام النظام
          </p>
        </div>
        <ReportsOverview />
      </div>
    </div>
  );
};

export default Reports;