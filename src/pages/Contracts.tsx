import { useState } from 'react';
import { Search, Plus, Filter, Eye, Edit, FileText, Calendar, Car, User } from 'lucide-react';
import AddContractDialog from '@/components/Contracts/AddContractDialog';
import VehicleReturnDialog from '@/components/Contracts/VehicleReturnDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import { ContractsOverview } from '@/components/Contracts/ContractsOverview';
import { ContractsAnalytics } from '@/components/Contracts/ContractsAnalytics';
import { FinancialReports } from '@/components/Contracts/FinancialReports';
import { ContractLifecycle } from '@/components/Contracts/ContractLifecycle';
import { DigitalSignatures } from '@/components/Contracts/DigitalSignatures';
import { AutomatedContracts } from '@/components/Contracts/AutomatedContracts';
import { AdvancedDashboard } from '@/components/Contracts/AdvancedDashboard';
import { ContractLifecycleTracker } from '@/components/Contracts/ContractLifecycleTracker';
import { AdvancedSearchFilter } from '@/components/Contracts/AdvancedSearchFilter';
import { SmartNotifications } from '@/components/Contracts/SmartNotifications';
import { ContractStatusManager } from '@/components/Contracts/ContractStatusManager';
import { useContracts } from '@/hooks/useContracts';

const statusConfig = {
  active: { label: 'نشط', color: 'bg-success text-success-foreground' },
  expired: { label: 'منتهي الصلاحية', color: 'bg-destructive text-destructive-foreground' },
  pending: { label: 'في الانتظار', color: 'bg-warning text-warning-foreground' },
  completed: { label: 'مكتمل', color: 'bg-secondary text-secondary-foreground' },
  cancelled: { label: 'ملغي', color: 'bg-muted text-muted-foreground' }
};

const contractTypeConfig = {
  daily: { label: 'يومي', color: 'bg-blue-100 text-blue-800' },
  monthly: { label: 'شهري', color: 'bg-green-100 text-green-800' }
};

const Contracts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { contracts, loading, stats, fetchContracts } = useContracts();

  // Filter contracts based on search and filters
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicle?.plate_number.includes(searchTerm) ||
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get contract type from duration
  const getContractType = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 'monthly' : 'daily';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    إدارة العقود المتقدمة
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    نظام شامل لإدارة العقود الذكية والتوقيع الإلكتروني وتتبع دورة الحياة
                  </p>
                </div>
                <div className="flex gap-2">
                  <VehicleReturnDialog />
                  <AddContractDialog />
                </div>
              </div>

              <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="grid w-full grid-cols-8">
                  <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
                  <TabsTrigger value="analytics">التحليلات</TabsTrigger>
                  <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="tracker">تتبع دورة الحياة</TabsTrigger>
                  <TabsTrigger value="search">البحث المتقدم</TabsTrigger>
                  <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
                  <TabsTrigger value="signatures">التوقيع الإلكتروني</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-6">
                  <ContractsAnalytics />
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                  <FinancialReports contracts={contracts} />
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-6">
                  <AdvancedDashboard contracts={contracts} stats={stats} />
                </TabsContent>

                <TabsContent value="overview" className="space-y-6">
                  <ContractsOverview />
                </TabsContent>

                <TabsContent value="tracker" className="space-y-6">
                  <ContractLifecycleTracker 
                    contract={contracts[0] || { id: 'sample-id', contract_number: 'C001' }} 
                    onStageUpdate={(contractId, stage) => console.log('Stage update:', contractId, stage)}
                  />
                </TabsContent>

                <TabsContent value="search" className="space-y-6">
                  <AdvancedSearchFilter 
                    onFiltersChange={(filters) => console.log('Filters:', filters)}
                    onExport={(format) => console.log('Export:', format)}
                  />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <SmartNotifications />
                </TabsContent>

                <TabsContent value="status-manager" className="space-y-6">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>إدارة حالة العقود</CardTitle>
                        <p className="text-muted-foreground">
                          إدارة شاملة لحالات العقود وتتبع دورة الحياة
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filteredContracts.slice(0, 5).map((contract) => (
                            <ContractStatusManager
                              key={contract.id}
                              contract={contract}
                              onStatusChange={() => fetchContracts()}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="classic" className="space-y-6" style={{ display: 'none' }}>
                  {/* الإدارة التقليدية الموجودة */}
                   {/* Summary Cards */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           العقود النشطة
                         </CardTitle>
                         <FileText className="h-4 w-4 text-success" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-success">{stats.active}</div>
                       </CardContent>
                     </Card>

                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           العقود المنتهية
                         </CardTitle>
                         <Calendar className="h-4 w-4 text-destructive" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
                       </CardContent>
                     </Card>

                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           في الانتظار
                         </CardTitle>
                         <Car className="h-4 w-4 text-warning" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                       </CardContent>
                     </Card>

                     <Card>
                       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium text-muted-foreground">
                           إجمالي الإيرادات
                         </CardTitle>
                         <User className="h-4 w-4 text-primary" />
                       </CardHeader>
                       <CardContent>
                         <div className="text-2xl font-bold text-primary">
                           {stats.totalRevenue.toLocaleString()} ر.س
                         </div>
                       </CardContent>
                     </Card>
                   </div>

                  {/* Filters and Search */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        البحث والتصفية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="البحث في العقود (العميل، المركبة، رقم العقد...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                          />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="حالة العقد" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="all">جميع الحالات</SelectItem>
                             <SelectItem value="active">نشط</SelectItem>
                             <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                             <SelectItem value="pending">في الانتظار</SelectItem>
                             <SelectItem value="completed">مكتمل</SelectItem>
                             <SelectItem value="cancelled">ملغي</SelectItem>
                           </SelectContent>
                         </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contracts Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>قائمة العقود ({filteredContracts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">رقم العقد</TableHead>
                              <TableHead className="text-right">العميل</TableHead>
                              <TableHead className="text-right">المركبة</TableHead>
                              <TableHead className="text-right">تاريخ البداية</TableHead>
                              <TableHead className="text-right">تاريخ النهاية</TableHead>
                              <TableHead className="text-right">المبلغ الشهري</TableHead>
                              <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                              <TableHead className="text-right">النوع</TableHead>
                              <TableHead className="text-right">الحالة</TableHead>
                              <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                           <TableBody>
                             {loading ? (
                               <TableRow>
                                 <TableCell colSpan={10} className="text-center">
                                   جاري تحميل العقود...
                                 </TableCell>
                               </TableRow>
                             ) : filteredContracts.length === 0 ? (
                               <TableRow>
                                 <TableCell colSpan={10} className="text-center text-muted-foreground">
                                   لا توجد عقود مطابقة للبحث
                                 </TableCell>
                               </TableRow>
                             ) : (
                               filteredContracts.map((contract) => (
                                 <TableRow key={contract.id}>
                                   <TableCell className="font-medium">{contract.contract_number}</TableCell>
                                   <TableCell>
                                     <div>
                                       <div className="font-medium">{contract.customer?.name || 'غير محدد'}</div>
                                       <div className="text-sm text-muted-foreground">{contract.customer?.phone || 'غير محدد'}</div>
                                     </div>
                                   </TableCell>
                                   <TableCell>
                                     <div>
                                       <div className="font-medium">
                                         {contract.vehicle?.brand} {contract.vehicle?.model} {contract.vehicle?.year}
                                       </div>
                                       <div className="text-sm text-muted-foreground">{contract.vehicle?.plate_number}</div>
                                     </div>
                                   </TableCell>
                                   <TableCell>{formatDate(contract.start_date)}</TableCell>
                                   <TableCell>{formatDate(contract.end_date)}</TableCell>
                                   <TableCell>
                                     {contract.daily_rate > 0 ? `${contract.daily_rate} ر.س` : '-'}
                                   </TableCell>
                                   <TableCell className="font-medium">
                                     {contract.total_amount.toLocaleString()} ر.س
                                   </TableCell>
                                   <TableCell>
                                     <Badge className={contractTypeConfig[getContractType(contract.start_date, contract.end_date)].color}>
                                       {contractTypeConfig[getContractType(contract.start_date, contract.end_date)].label}
                                     </Badge>
                                   </TableCell>
                                   <TableCell>
                                     <Badge className={statusConfig[contract.status].color}>
                                       {statusConfig[contract.status].label}
                                     </Badge>
                                   </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        {contract.status === 'active' && (
                                          <VehicleReturnDialog contractId={contract.id} />
                                        )}
                                      </div>
                                    </TableCell>
                                 </TableRow>
                               ))
                             )}
                           </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lifecycle" className="space-y-6">
                  <ContractLifecycle />
                </TabsContent>

                <TabsContent value="lifecycle" className="space-y-6">
                  <ContractLifecycle />
                </TabsContent>

                <TabsContent value="signatures" className="space-y-6">
                  <DigitalSignatures />
                </TabsContent>

                <TabsContent value="automation" className="space-y-6">
                  <AutomatedContracts />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Contracts;