import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import { ContractsHeader } from '@/components/Contracts/ContractsHeader';
import { ContractsStats } from '@/components/Contracts/ContractsStats';
import { ContractsTable } from '@/components/Contracts/ContractsTable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContracts } from '@/hooks/useContracts';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  FileText,
  AlertTriangle
} from "lucide-react";

const ContractsEssential = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { contracts, loading, stats } = useContracts();

  // حساب البيانات المالية الأساسية
  const financialData = {
    totalRevenue: contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0),
    totalPaid: contracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0),
    pendingAmount: contracts.reduce((sum, c) => sum + ((c.total_amount || 0) - (c.paid_amount || 0)), 0),
    overdueContracts: contracts.filter(c => 
      new Date(c.end_date) < new Date() && c.status === 'active'
    ).length
  };

  // العقود التي تحتاج متابعة
  const actionRequired = contracts.filter(c => 
    c.status === 'active' && 
    (new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24) <= 7
  );

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
              <ContractsHeader 
                title="إدارة العقود الأساسية"
                description="إدارة مبسطة وعملية للعقود مع التركيز على البيانات المالية"
              />

              {/* إحصائيات العقود الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      إجمالي الإيرادات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {financialData.totalRevenue.toLocaleString()} ريال
                    </div>
                    <div className="text-xs text-muted-foreground">
                      من {contracts.length} عقد
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      المحصل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {financialData.totalPaid.toLocaleString()} ريال
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {financialData.totalRevenue > 0 ? 
                        Math.round((financialData.totalPaid / financialData.totalRevenue) * 100) : 0
                      }% معدل التحصيل
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      المبالغ المعلقة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {financialData.pendingAmount.toLocaleString()} ريال
                    </div>
                    <div className="text-xs text-muted-foreground">
                      يحتاج متابعة
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      عقود متأخرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {financialData.overdueContracts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      يحتاج إجراء فوري
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* العقود التي تحتاج متابعة */}
              {actionRequired.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-5 w-5" />
                      عقود تحتاج متابعة ({actionRequired.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {actionRequired.slice(0, 5).map((contract, index) => {
                        const daysLeft = Math.ceil(
                          (new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                        );
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"}>
                                {daysLeft} يوم متبقي
                              </Badge>
                              <div>
                                <div className="font-medium">{contract.contract_number}</div>
                                <div className="text-sm text-muted-foreground">
                                  ينتهي في {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                {(contract.total_amount || 0).toLocaleString()} ريال
                              </div>
                              <div className="text-sm text-muted-foreground">
                                متبقي: {((contract.total_amount || 0) - (contract.paid_amount || 0)).toLocaleString()} ريال
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* جدول العقود الأساسي */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    جدول العقود
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractsTable contracts={contracts} loading={loading} />
                </CardContent>
              </Card>

              {/* إحصائيات سريعة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">متوسط قيمة العقد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {contracts.length > 0 ? 
                        Math.round(financialData.totalRevenue / contracts.length).toLocaleString() : 0
                      } ريال
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">العقود النشطة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {contracts.filter(c => c.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">العقود المكتملة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {contracts.filter(c => c.status === 'completed').length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContractsEssential;