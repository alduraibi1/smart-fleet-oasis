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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="revenue-expense">الإيرادات والمصروفات</TabsTrigger>
                  <TabsTrigger value="cash-flow">التدفق النقدي</TabsTrigger>
                  <TabsTrigger value="assets">الأصول</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <AccountingOverview />
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
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}