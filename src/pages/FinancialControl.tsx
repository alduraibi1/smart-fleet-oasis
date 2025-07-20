
import { FinancialControlDashboard } from "@/components/Accounting/FinancialControl/FinancialControlDashboard";
import Header from "@/components/Layout/Header";

export default function FinancialControl() {
  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => {}} />
      <main className="container mx-auto p-6">
        <FinancialControlDashboard />
      </main>
    </div>
  );
}
