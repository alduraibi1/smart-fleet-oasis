import { ReportsOverview } from "@/components/Reports/ReportsOverview";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { useState } from "react";

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
            <p className="text-muted-foreground mt-2">
              مركز التقارير الشامل لجميع أقسام النظام
            </p>
          </div>
          <ReportsOverview />
        </main>
      </div>
    </div>
  );
};

export default Reports;