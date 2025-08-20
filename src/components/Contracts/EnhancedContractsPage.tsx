
import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ContractFormWizard } from './ContractFormWizard';
import { ContractStatusTracker } from './ContractStatusTracker';
import { ContractActions } from './ContractActions';
import { useContracts } from '@/hooks/useContracts';

export const EnhancedContractsPage: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { contracts, loading, stats } = useContracts();

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.vehicle?.plate_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || contract.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getTabCount = (status: string) => {
    if (status === 'all') return contracts.length;
    return contracts.filter(c => c.status === status).length;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة العقود المتقدمة</h1>
          <p className="text-muted-foreground">
            نظام شامل لإدارة العقود الذكية والتوقيع الإلكتروني وتتبع دورة الحياة
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة عقد جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقود</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              جميع العقود في النظام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقود النشطة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              العقود قيد التنفيذ حالياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات الشهرية</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ريال سعودي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة العقد</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.avgContractValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ريال سعودي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في العقود (رقم العقد، اسم العميل، لوحة المركبة...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              فلترة متقدمة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العقود</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                الكل
                <Badge variant="secondary" className="text-xs">
                  {getTabCount('all')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                نشط
                <Badge variant="secondary" className="text-xs">
                  {getTabCount('active')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                معلق
                <Badge variant="secondary" className="text-xs">
                  {getTabCount('pending')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                مكتمل
                <Badge variant="secondary" className="text-xs">
                  {getTabCount('completed')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex items-center gap-2">
                منتهي
                <Badge variant="secondary" className="text-xs">
                  {getTabCount('expired')}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                ملغي
                <Badge variant="secondary" className="text-xs">
                  {getTabCount('cancelled')}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">جاري تحميل العقود...</div>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <div className="text-muted-foreground mb-2">لا توجد عقود متطابقة</div>
                  <Button onClick={() => setShowAddDialog(true)} variant="outline">
                    إضافة عقد جديد
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContracts.map((contract) => (
                    <div key={contract.id} className="relative">
                      <ContractStatusTracker contract={contract} />
                      <div className="absolute top-4 right-4">
                        <ContractActions contract={contract} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Contract Wizard */}
      <ContractFormWizard 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};
