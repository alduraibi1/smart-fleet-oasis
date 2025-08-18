import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowLeft, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import AddContractDialog from '@/components/Contracts/AddContractDialog';
import VehicleReturnDialog from '@/components/Contracts/VehicleReturnDialog';

const Contracts = () => {
  const { contracts, stats, loading } = useContracts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter contracts based on search and tab
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.vehicle?.plate_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'active') return matchesSearch && contract.status === 'active';
    if (activeTab === 'completed') return matchesSearch && contract.status === 'completed';
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary",
      cancelled: "destructive",
      pending: "outline"
    };
    
    const labels: Record<string, string> = {
      active: "نشط",
      completed: "مكتمل",
      cancelled: "ملغي",
      pending: "معلق"
    };

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="page-container">
          <div className="content-wrapper">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">جاري تحميل العقود...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">العقود</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                إدارة عقود الإيجار والمدفوعات المالية
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء عقد جديد
              </Button>
              <Button onClick={() => setShowReturnDialog(true)} variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                إرجاع مركبة
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">العقود النشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">العقود المكتملة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي العقود</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">الإيرادات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString()} ر.س</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>قائمة العقود</CardTitle>
                
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث في العقود..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">جميع العقود</TabsTrigger>
                  <TabsTrigger value="active">العقود النشطة</TabsTrigger>
                  <TabsTrigger value="completed">العقود المكتملة</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                  {/* Contracts Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-3 font-medium">رقم العقد</th>
                          <th className="text-right p-3 font-medium">العميل</th>
                          <th className="text-right p-3 font-medium">المركبة</th>
                          <th className="text-right p-3 font-medium">تاريخ البداية</th>
                          <th className="text-right p-3 font-medium">تاريخ النهاية</th>
                          <th className="text-right p-3 font-medium">المبلغ الإجمالي</th>
                          <th className="text-right p-3 font-medium">الحالة</th>
                          <th className="text-right p-3 font-medium">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContracts.map((contract) => (
                          <tr key={contract.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">{contract.contract_number}</td>
                            <td className="p-3">{contract.customer?.name || 'غير محدد'}</td>
                            <td className="p-3">
                              {contract.vehicle ? 
                                `${contract.vehicle.brand} ${contract.vehicle.model} - ${contract.vehicle.plate_number}` 
                                : 'غير محدد'
                              }
                            </td>
                            <td className="p-3">{new Date(contract.start_date).toLocaleDateString('ar-SA')}</td>
                            <td className="p-3">{new Date(contract.end_date).toLocaleDateString('ar-SA')}</td>
                            <td className="p-3">{contract.total_amount.toLocaleString()} ر.س</td>
                            <td className="p-3">{getStatusBadge(contract.status)}</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {contract.status === 'active' && (
                                  <Button variant="ghost" size="sm" onClick={() => setShowReturnDialog(true)}>
                                    <ArrowLeft className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredContracts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        لا توجد عقود تطابق معايير البحث
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <AddContractDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
        />
        
        <VehicleReturnDialog />
      </div>
    </AppLayout>
  );
};

export default Contracts;
