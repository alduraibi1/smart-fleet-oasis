import { useState } from 'react';
import { Search, Plus, Filter, Eye, Edit, FileText, Calendar, Car, User } from 'lucide-react';
import AddContractDialog from '@/components/Contracts/AddContractDialog';
import VehicleReturnDialog from '@/components/Contracts/VehicleReturnDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

// Mock data for contracts
const contractsData = [
  {
    id: 'C001',
    customerName: 'أحمد محمد علي',
    customerPhone: '0501234567',
    vehicleModel: 'تويوتا كامري 2023',
    vehiclePlate: 'أ ب ج 1234',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    monthlyRate: 1200,
    totalAmount: 7200,
    status: 'active',
    contractType: 'monthly'
  },
  {
    id: 'C002',
    customerName: 'فاطمة أحمد',
    customerPhone: '0507654321',
    vehicleModel: 'نيسان التيما 2022',
    vehiclePlate: 'هـ و ز 5678',
    startDate: '2024-02-01',
    endDate: '2024-08-01',
    monthlyRate: 1000,
    totalAmount: 6000,
    status: 'active',
    contractType: 'monthly'
  },
  {
    id: 'C003',
    customerName: 'محمد سعد',
    customerPhone: '0509876543',
    vehicleModel: 'هونداي إلنترا 2021',
    vehiclePlate: 'ط ي ك 9012',
    startDate: '2023-12-01',
    endDate: '2024-06-01',
    monthlyRate: 900,
    totalAmount: 5400,
    status: 'expired',
    contractType: 'monthly'
  },
  {
    id: 'C004',
    customerName: 'سارة خالد',
    customerPhone: '0502468135',
    vehicleModel: 'كيا سيراتو 2023',
    vehiclePlate: 'ل م ن 3456',
    startDate: '2024-03-01',
    endDate: '2024-09-01',
    monthlyRate: 1100,
    totalAmount: 6600,
    status: 'pending',
    contractType: 'monthly'
  },
  {
    id: 'C005',
    customerName: 'عبدالله حسن',
    customerPhone: '0508642097',
    vehicleModel: 'فورد فوكس 2022',
    vehiclePlate: 'س ع ف 7890',
    startDate: '2024-01-10',
    endDate: '2024-01-17',
    monthlyRate: 0,
    totalAmount: 350,
    status: 'completed',
    contractType: 'daily'
  }
];

const statusConfig = {
  active: { label: 'نشط', color: 'bg-rental-success text-white' },
  expired: { label: 'منتهي الصلاحية', color: 'bg-rental-danger text-white' },
  pending: { label: 'في الانتظار', color: 'bg-rental-warning text-white' },
  completed: { label: 'مكتمل', color: 'bg-rental-secondary text-white' }
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

  const filteredContracts = contractsData.filter(contract => {
    const matchesSearch = 
      contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehiclePlate.includes(searchTerm) ||
      contract.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.contractType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Contract summary stats
  const activeContracts = contractsData.filter(c => c.status === 'active').length;
  const expiredContracts = contractsData.filter(c => c.status === 'expired').length;
  const pendingContracts = contractsData.filter(c => c.status === 'pending').length;
  const totalRevenue = contractsData
    .filter(c => c.status === 'active' || c.status === 'completed')
    .reduce((sum, c) => sum + c.totalAmount, 0);

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
                    إدارة العقود
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    إدارة عقود الإيجار ومتابعة حالاتها وتجديدها
                  </p>
                </div>
                <div className="flex gap-2">
                  <VehicleReturnDialog />
                  <AddContractDialog />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      العقود النشطة
                    </CardTitle>
                    <FileText className="h-4 w-4 text-rental-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-rental-success">{activeContracts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      العقود المنتهية
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-rental-danger" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-rental-danger">{expiredContracts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      في الانتظار
                    </CardTitle>
                    <Car className="h-4 w-4 text-rental-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-rental-warning">{pendingContracts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      إجمالي الإيرادات
                    </CardTitle>
                    <User className="h-4 w-4 text-rental-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-rental-primary">
                      {totalRevenue.toLocaleString()} ر.س
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
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="نوع العقد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="daily">يومي</SelectItem>
                        <SelectItem value="monthly">شهري</SelectItem>
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
                        {filteredContracts.map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell className="font-medium">{contract.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{contract.customerName}</div>
                                <div className="text-sm text-muted-foreground">{contract.customerPhone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{contract.vehicleModel}</div>
                                <div className="text-sm text-muted-foreground">{contract.vehiclePlate}</div>
                              </div>
                            </TableCell>
                            <TableCell>{contract.startDate}</TableCell>
                            <TableCell>{contract.endDate}</TableCell>
                            <TableCell>
                              {contract.monthlyRate > 0 ? `${contract.monthlyRate} ر.س` : '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {contract.totalAmount.toLocaleString()} ر.س
                            </TableCell>
                            <TableCell>
                              <Badge className={contractTypeConfig[contract.contractType].color}>
                                {contractTypeConfig[contract.contractType].label}
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
                                {contract.status === 'expired' && (
                                  <Button variant="ghost" size="sm" className="text-rental-primary">
                                    <Calendar className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Contracts;