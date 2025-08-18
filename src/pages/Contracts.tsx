
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useContracts } from '@/hooks/useContracts';
import { ContractsOverview } from '@/components/Contracts/ContractsOverview';
import { ContractsTable } from '@/components/Contracts/ContractsTable';
import { AddContractDialog } from '@/components/Contracts/AddContractDialog';
import { VehicleReturnDialog } from '@/components/Contracts/VehicleReturnDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter, FileText, Calendar, DollarSign, Edit, ArrowLeft, Eye } from 'lucide-react';

const Contracts = () => {
  const { contracts, stats, loading } = useContracts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // تصفية العقود حسب التبويب النشط
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.vehicle?.plate_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || contract.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'expired': return 'منتهي';
      case 'cancelled': return 'ملغي';
      case 'pending': return 'في الانتظار';
      default: return status;
    }
  };

  // الحصول على لون طريقة الدفع
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'partial': return 'جزئي';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي العقود</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">العقود النشطة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">الإيرادات الشهرية</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.monthlyRevenue.toLocaleString()} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">العقود المكتملة</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أدوات البحث والتصفية */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>إدارة العقود</CardTitle>
              <div className="flex gap-2">
                <AddContractDialog />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* شريط البحث والتصفية */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في العقود (رقم العقد، اسم العميل، رقم اللوحة...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                تصفية متقدمة
              </Button>
            </div>

            {/* تبويبات الحالة */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">الكل ({stats.total})</TabsTrigger>
                <TabsTrigger value="active">نشط ({stats.active})</TabsTrigger>
                <TabsTrigger value="completed">مكتمل ({stats.completed})</TabsTrigger>
                <TabsTrigger value="expired">منتهي ({stats.expired})</TabsTrigger>
                <TabsTrigger value="pending">معلق ({stats.pending})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* جدول العقود */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">جاري تحميل العقود...</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">لا توجد عقود</p>
                <p className="text-gray-600">
                  {searchTerm ? 'لم يتم العثور على عقود تطابق معايير البحث' : 'لم يتم إنشاء أي عقود بعد'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العقد
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العميل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المركبة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المدة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبلغ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contract.contract_number}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(contract.created_at).toLocaleDateString('ar-SA')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contract.customer?.name || 'غير محدد'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {contract.customer?.phone || ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contract.vehicle?.plate_number || 'غير محدد'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {contract.vehicle?.brand} {contract.vehicle?.model}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              من: {new Date(contract.start_date).toLocaleDateString('ar-SA')}
                            </div>
                            <div>
                              إلى: {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {contract.total_amount.toLocaleString()} ر.س
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPaymentStatusColor(contract.payment_status)}`}
                            >
                              {getPaymentStatusText(contract.payment_status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(contract.status)}
                            >
                              {getStatusText(contract.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Contracts;
