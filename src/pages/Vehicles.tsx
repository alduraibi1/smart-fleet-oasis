
import { useState } from 'react';
import { Car, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';

export default function Vehicles() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const vehicles = [
    {
      id: '1',
      plateNumber: 'أ ب ج 123',
      brand: 'تويوتا',
      model: 'كامري',
      year: 2023,
      color: 'أبيض',
      status: 'available',
      dailyRate: 150,
      mileage: 15000
    },
    {
      id: '2',
      plateNumber: 'د هـ و 456',
      brand: 'هيونداي',
      model: 'إلنترا',
      year: 2022,
      color: 'أسود',
      status: 'rented',
      dailyRate: 120,
      mileage: 25000
    },
    {
      id: '3',
      plateNumber: 'ز ح ط 789',
      brand: 'نيسان',
      model: 'التيما',
      year: 2021,
      color: 'فضي',
      status: 'maintenance',
      dailyRate: 130,
      mileage: 35000
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'متاحة', variant: 'default' as const },
      rented: { label: 'مؤجرة', variant: 'secondary' as const },
      maintenance: { label: 'صيانة', variant: 'destructive' as const },
      out_of_service: { label: 'خارج الخدمة', variant: 'outline' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
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
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">إدارة المركبات</h1>
                  <p className="text-muted-foreground">إدارة وتتبع جميع مركبات الأسطول</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة مركبة جديدة
                </Button>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="البحث في المركبات..." className="pr-10" />
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      تصفية
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => {
                  const statusBadge = getStatusBadge(vehicle.status);
                  return (
                    <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Car className="h-5 w-5" />
                              {vehicle.plateNumber}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.brand} {vehicle.model} {vehicle.year}
                            </p>
                          </div>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">اللون:</span>
                            <p className="font-medium">{vehicle.color}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الكيلومترات:</span>
                            <p className="font-medium">{vehicle.mileage.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">السعر اليومي:</span>
                            <p className="font-medium">₪{vehicle.dailyRate}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button size="sm" className="flex-1">
                            عرض التفاصيل
                          </Button>
                          <Button size="sm" variant="outline">
                            تعديل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
