import { useState } from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { AccountingOverview } from "@/components/Accounting/AccountingOverview";
import { RevenueExpenseReport } from "@/components/Accounting/RevenueExpenseReport";
import { CashFlowReport } from "@/components/Accounting/CashFlowReport";
import { AssetsReport } from "@/components/Accounting/AssetsReport";
import { AccountsReceivable } from "@/components/Accounting/AccountsReceivable";
import { AccountsPayable } from "@/components/Accounting/AccountsPayable";
import { TaxManagement } from "@/components/Accounting/TaxManagement";
import { FinancialKPIs } from "@/components/Accounting/FinancialKPIs";
import { FinancialForecasting } from "@/components/Accounting/FinancialForecasting";
import { ExecutiveDashboard } from "@/components/Accounting/ExecutiveDashboard";
import { VehicleProfitabilityReport } from "@/components/Accounting/VehicleProfitability/VehicleProfitabilityReport";
import { OwnerProfitabilityReport } from "@/components/Accounting/OwnerProfitability/OwnerProfitabilityReport";
import { VouchersManagement } from "@/components/Accounting/VouchersManagement/VouchersManagement";
import { InvoiceManagement } from "@/components/Accounting/IntegratedInvoicing/InvoiceManagement";
import { CostTracking } from "@/components/Accounting/IntegratedCosts/CostTracking";

export default function Accounting() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:mr-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">النظام المحاسبي</h1>
                  <p className="text-muted-foreground mt-2">
                    إدارة ومتابعة الوضع المالي للشركة
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    تخصيص الفترة
                  </Button>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير التقارير
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 xl:grid-cols-14">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="invoices">الفواتير</TabsTrigger>
                  <TabsTrigger value="vouchers">السندات</TabsTrigger>
                  <TabsTrigger value="costs">التكاليف</TabsTrigger>
                  <TabsTrigger value="vehicle-profitability">ربحية المركبات</TabsTrigger>
                  <TabsTrigger value="owner-profitability">أرباح المالكين</TabsTrigger>
                  <TabsTrigger value="revenue-expense">الإيرادات</TabsTrigger>
                  <TabsTrigger value="cash-flow">التدفق النقدي</TabsTrigger>
                  <TabsTrigger value="assets">الأصول</TabsTrigger>
                  <TabsTrigger value="receivables">المدينة</TabsTrigger>
                  <TabsTrigger value="payables">الدائنة</TabsTrigger>
                  <TabsTrigger value="tax">الضرائب</TabsTrigger>
                  <TabsTrigger value="kpis">مؤشرات الأداء</TabsTrigger>
                  <TabsTrigger value="forecasting">التنبؤات</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <AccountingOverview />
                </TabsContent>

                <TabsContent value="invoices" className="space-y-6">
                  <InvoiceManagement />
                </TabsContent>

                <TabsContent value="vouchers" className="space-y-6">
                  <VouchersManagement />
                </TabsContent>

                <TabsContent value="costs" className="space-y-6">
                  <CostTracking />
                </TabsContent>

                <TabsContent value="revenue-expense" className="space-y-6">
                  <RevenueExpenseReport />
                </TabsContent>

                <TabsContent value="cash-flow" className="space-y-6">
                  <CashFlowReport />
                </TabsContent>

                <TabsContent value="assets" className="space-y-6">
                  <AssetsReport />
                </TabsContent>

                <TabsContent value="receivables" className="space-y-6">
                  <AccountsReceivable />
                </TabsContent>

                <TabsContent value="payables" className="space-y-6">
                  <AccountsPayable />
                </TabsContent>

                <TabsContent value="vehicle-profitability" className="space-y-6">
                  <VehicleProfitabilityReport />
                </TabsContent>

                <TabsContent value="owner-profitability" className="space-y-6">
                  <OwnerProfitabilityReport />
                </TabsContent>


                <TabsContent value="tax" className="space-y-6">
                  <TaxManagement />
                </TabsContent>

                <TabsContent value="kpis" className="space-y-6">
                  <FinancialKPIs />
                </TabsContent>

                <TabsContent value="forecasting" className="space-y-6">
                  <FinancialForecasting />
                </TabsContent>

                <TabsContent value="executive" className="space-y-6">
                  <ExecutiveDashboard />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}