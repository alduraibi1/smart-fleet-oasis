import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { 
  Car, 
  Wrench, 
  Fuel, 
  Shield, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Search,
  Filter
} from "lucide-react";

export function CostTracking() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for vehicle costs
  const vehicleCosts = [
    {
      id: "1",
      plateNumber: "أ ب ج 123",
      brand: "تويوتا",
      model: "كامري",
      totalCosts: 8500,
      maintenanceCosts: 3200,
      fuelCosts: 2100,
      insuranceCosts: 1500,
      depreciation: 1200,
      otherCosts: 500,
      revenue: 15000,
      profit: 6500,
      profitMargin: 43.3,
      lastMaintenanceDate: new Date("2024-01-10"),
      costPerKm: 0.85,
      utilizationRate: 78
    },
    {
      id: "2",
      plateNumber: "د هـ و 456", 
      brand: "هيونداي",
      model: "النترا",
      totalCosts: 6800,
      maintenanceCosts: 2500,
      fuelCosts: 1800,
      insuranceCosts: 1200,
      depreciation: 1000,
      otherCosts: 300,
      revenue: 12000,
      profit: 5200,
      profitMargin: 43.3,
      lastMaintenanceDate: new Date("2024-01-08"),
      costPerKm: 0.75,
      utilizationRate: 85
    }
  ];

  // Mock data for cost breakdown
  const costBreakdown = {
    totalCosts: 15300,
    maintenanceCosts: 5700,
    fuelCosts: 3900,
    insuranceCosts: 2700,
    depreciation: 2200,
    otherCosts: 800,
    costCategories: [
      { category: "صيانة", amount: 5700, percentage: 37.3, trend: "up" },
      { category: "وقود", amount: 3900, percentage: 25.5, trend: "down" },
      { category: "تأمين", amount: 2700, percentage: 17.6, trend: "stable" },
      { category: "إهلاك", amount: 2200, percentage: 14.4, trend: "stable" },
      { category: "أخرى", amount: 800, percentage: 5.2, trend: "up" }
    ]
  };

  // Mock maintenance cost details
  const maintenanceCosts = [
    {
      id: "1",
      vehicleId: "1",
      plateNumber: "أ ب ج 123",
      date: new Date("2024-01-15"),
      type: "صيانة دورية",
      description: "تغيير زيت وفلاتر",
      partsCost: 450,
      laborCost: 200,
      oilsCost: 180,
      totalCost: 830,
      mechanicName: "أحمد الميكانيكي",
      status: "مكتملة"
    },
    {
      id: "2",
      vehicleId: "2", 
      plateNumber: "د هـ و 456",
      date: new Date("2024-01-12"),
      type: "إصلاح عطل",
      description: "إصلاح مكيف الهواء",
      partsCost: 1200,
      laborCost: 300,
      oilsCost: 0,
      totalCost: 1500,
      mechanicName: "محمد الفني",
      status: "مكتملة"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <DollarSign className="h-4 w-4 text-blue-500" />;
    }
  };

  const getProfitabilityBadge = (margin: number) => {
    if (margin >= 40) return <Badge variant="default" className="bg-green-500">ممتاز</Badge>;
    if (margin >= 25) return <Badge variant="secondary">جيد</Badge>;
    if (margin >= 10) return <Badge variant="outline">متوسط</Badge>;
    return <Badge variant="destructive">ضعيف</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التكاليف</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(costBreakdown.totalCosts)}</p>
              </div>
              <Receipt className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تكاليف الصيانة</p>
                <p className="text-2xl font-bold">{formatCurrency(costBreakdown.maintenanceCosts)}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تكاليف الوقود</p>
                <p className="text-2xl font-bold">{formatCurrency(costBreakdown.fuelCosts)}</p>
              </div>
              <Fuel className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تكاليف التأمين</p>
                <p className="text-2xl font-bold">{formatCurrency(costBreakdown.insuranceCosts)}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">تحليل التكاليف</TabsTrigger>
          <TabsTrigger value="vehicles">تكاليف المركبات</TabsTrigger>
          <TabsTrigger value="maintenance">تفاصيل الصيانة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        {/* Cost Breakdown */}
        <TabsContent value="breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل التكاليف حسب الفئة</CardTitle>
              <CardDescription>توزيع التكاليف على الفئات المختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costBreakdown.costCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(category.trend)}
                      <div>
                        <h3 className="font-medium">{category.category}</h3>
                        <p className="text-sm text-muted-foreground">{category.percentage}% من إجمالي التكاليف</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold">{formatCurrency(category.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.trend === 'up' ? '+5%' : category.trend === 'down' ? '-3%' : '0%'} من الشهر الماضي
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Costs */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>تكاليف المركبات</CardTitle>
                  <CardDescription>تحليل التكاليف والربحية لكل مركبة</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="اختر المركبة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المركبات</SelectItem>
                      {vehicleCosts.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المركبة</TableHead>
                      <TableHead>إجمالي التكاليف</TableHead>
                      <TableHead>صيانة</TableHead>
                      <TableHead>وقود</TableHead>
                      <TableHead>تأمين</TableHead>
                      <TableHead>إهلاك</TableHead>
                      <TableHead>الإيرادات</TableHead>
                      <TableHead>الربح</TableHead>
                      <TableHead>هامش الربح</TableHead>
                      <TableHead>الأداء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleCosts
                      .filter(vehicle => selectedVehicle === "all" || vehicle.id === selectedVehicle)
                      .map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vehicle.plateNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {vehicle.brand} {vehicle.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {formatCurrency(vehicle.totalCosts)}
                        </TableCell>
                        <TableCell>{formatCurrency(vehicle.maintenanceCosts)}</TableCell>
                        <TableCell>{formatCurrency(vehicle.fuelCosts)}</TableCell>
                        <TableCell>{formatCurrency(vehicle.insuranceCosts)}</TableCell>
                        <TableCell>{formatCurrency(vehicle.depreciation)}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(vehicle.revenue)}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(vehicle.profit)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{vehicle.profitMargin.toFixed(1)}%</span>
                            {getProfitabilityBadge(vehicle.profitMargin)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">معدل الاستخدام: </span>
                              <span className="font-medium">{vehicle.utilizationRate}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">التكلفة/كم: </span>
                              <span className="font-medium">{formatCurrency(vehicle.costPerKm)}</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Details */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>تفاصيل تكاليف الصيانة</CardTitle>
                  <CardDescription>تفاصيل جميع عمليات الصيانة والتكاليف المرتبطة</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-9 w-[200px]"
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    تصفية
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المركبة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>قطع الغيار</TableHead>
                      <TableHead>العمالة</TableHead>
                      <TableHead>الزيوت</TableHead>
                      <TableHead>الإجمالي</TableHead>
                      <TableHead>الميكانيكي</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceCosts.map((maintenance) => (
                      <TableRow key={maintenance.id}>
                        <TableCell>
                          <div className="font-medium">{maintenance.plateNumber}</div>
                        </TableCell>
                        <TableCell>{maintenance.date.toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{maintenance.type}</Badge>
                        </TableCell>
                        <TableCell>{maintenance.description}</TableCell>
                        <TableCell>{formatCurrency(maintenance.partsCost)}</TableCell>
                        <TableCell>{formatCurrency(maintenance.laborCost)}</TableCell>
                        <TableCell>{formatCurrency(maintenance.oilsCost)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(maintenance.totalCost)}
                        </TableCell>
                        <TableCell>{maintenance.mechanicName}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {maintenance.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات التكاليف</CardTitle>
              <CardDescription>تحليل اتجاهات التكاليف خلال الفترة الزمنية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cost trend alerts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        <div>
                          <h3 className="font-medium">تنبيه: ارتفاع تكاليف الصيانة</h3>
                          <p className="text-sm text-muted-foreground">
                            زيادة 15% في تكاليف الصيانة هذا الشهر
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="h-8 w-8 text-green-500" />
                        <div>
                          <h3 className="font-medium">انخفاض تكاليف الوقود</h3>
                          <p className="text-sm text-muted-foreground">
                            توفير 8% في تكاليف الوقود
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium">تحسن هامش الربح</h3>
                          <p className="text-sm text-muted-foreground">
                            زيادة هامش الربح إلى 43.3%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Period selector */}
                <div className="flex gap-4">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">الأسبوع الحالي</SelectItem>
                      <SelectItem value="month">الشهر الحالي</SelectItem>
                      <SelectItem value="quarter">الربع الحالي</SelectItem>
                      <SelectItem value="year">السنة الحالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost comparison table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>فئة التكلفة</TableHead>
                        <TableHead>الفترة الحالية</TableHead>
                        <TableHead>الفترة السابقة</TableHead>
                        <TableHead>التغيير</TableHead>
                        <TableHead>النسبة</TableHead>
                        <TableHead>الاتجاه</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>صيانة</TableCell>
                        <TableCell>{formatCurrency(5700)}</TableCell>
                        <TableCell>{formatCurrency(4950)}</TableCell>
                        <TableCell className="text-red-600">+{formatCurrency(750)}</TableCell>
                        <TableCell className="text-red-600">+15.2%</TableCell>
                        <TableCell><TrendingUp className="h-4 w-4 text-red-500" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>وقود</TableCell>
                        <TableCell>{formatCurrency(3900)}</TableCell>
                        <TableCell>{formatCurrency(4235)}</TableCell>
                        <TableCell className="text-green-600">-{formatCurrency(335)}</TableCell>
                        <TableCell className="text-green-600">-7.9%</TableCell>
                        <TableCell><TrendingDown className="h-4 w-4 text-green-500" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>تأمين</TableCell>
                        <TableCell>{formatCurrency(2700)}</TableCell>
                        <TableCell>{formatCurrency(2700)}</TableCell>
                        <TableCell>{formatCurrency(0)}</TableCell>
                        <TableCell>0%</TableCell>
                        <TableCell><DollarSign className="h-4 w-4 text-blue-500" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}