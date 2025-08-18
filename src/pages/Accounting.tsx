
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  FileText,
  PieChart,
  BarChart3,
  Download,
  Filter
} from 'lucide-react';

// Import accounting components
import { AccountingOverview } from '@/components/Accounting/AccountingOverview';
import { IntegratedFinancialDashboard } from '@/components/Accounting/IntegratedFinancialDashboard';
import { VouchersManagement } from '@/components/Accounting/VouchersManagement/VouchersManagement';

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const quickStats = [
    {
      title: "إجمالي الإيرادات",
      value: "524,000 ر.س",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "المصروفات",
      value: "189,000 ر.س", 
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "صافي الربح",
      value: "335,000 ر.س",
      change: "+18.3%",
      trend: "up",
      icon: BarChart3,
      color: "text-emerald-600"
    },
    {
      title: "السندات المعلقة",
      value: "23",
      change: "-8%",
      trend: "down",
      icon: FileText,
      color: "text-orange-600"
    }
  ];

  const mainTabs = [
    { id: "overview", label: "نظرة عامة", icon: PieChart },
    { id: "dashboard", label: "لوحة التحكم", icon: BarChart3 },
    { id: "vouchers", label: "إدارة السندات", icon: FileText },
  ];

  return (
    <AppLayout>
      <div className="page-container">
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">المحاسبة</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                إدارة شاملة للشؤون المالية والمحاسبية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="btn-responsive">
                <Filter className="h-4 w-4 mr-2" />
                فلترة
              </Button>
              <Button size="sm" className="btn-responsive">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-container">
            {quickStats.map((stat, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${stat.color} bg-transparent`}
                        >
                          {stat.change}
                        </Badge>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg bg-background ${stat.color} opacity-80`}>
                      <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                إدارة المحاسبة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 sm:px-6 border-b border-border/50">
                  <div className="flexible-tabs">
                    <TabsList className="tabs-list bg-muted/50 h-auto p-1">
                      {mainTabs.map((tab) => (
                        <TabsTrigger 
                          key={tab.id}
                          value={tab.id} 
                          className="tabs-trigger data-[state=active]:bg-background"
                        >
                          <tab.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <TabsContent value="overview" className="mt-0">
                    <AccountingOverview />
                  </TabsContent>
                  
                  <TabsContent value="dashboard" className="mt-0">
                    <IntegratedFinancialDashboard />
                  </TabsContent>
                  
                  <TabsContent value="vouchers" className="mt-0">
                    <VouchersManagement />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Accounting;
