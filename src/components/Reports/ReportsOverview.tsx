import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Car,
  Users,
  Package,
  FileCheck,
  Clock,
  Star
} from "lucide-react";

const quickStats = [
  { title: "إجمالي الإيرادات", value: "567,890 ر.س", change: "+12.3%", icon: DollarSign, color: "text-green-600" },
  { title: "المركبات النشطة", value: "127", change: "+5", icon: Car, color: "text-blue-600" },
  { title: "العملاء", value: "89", change: "+8", icon: Users, color: "text-purple-600" },
  { title: "العقود النشطة", value: "45", change: "+3", icon: FileCheck, color: "text-orange-600" }
];

const revenueData = [
  { month: "يناير", revenue: 45000 },
  { month: "فبراير", revenue: 52000 },
  { month: "مارس", revenue: 48000 },
  { month: "أبريل", revenue: 61000 },
  { month: "مايو", revenue: 55000 },
  { month: "يونيو", revenue: 67000 }
];

const expenseData = [
  { name: "الصيانة", value: 35, color: "#3b82f6" },
  { name: "الوقود", value: 25, color: "#ef4444" },
  { name: "التأمين", value: 20, color: "#10b981" },
  { name: "أخرى", value: 20, color: "#f59e0b" }
];

const reportCategories = [
  {
    title: "التقارير المالية",
    icon: DollarSign,
    reports: [
      { name: "تقرير الإيرادات والمصروفات", lastGenerated: "منذ ساعة", popular: true },
      { name: "تقرير التدفق النقدي", lastGenerated: "منذ 3 ساعات", popular: false },
      { name: "تقرير الأصول", lastGenerated: "أمس", popular: true },
      { name: "تقرير الضرائب", lastGenerated: "منذ يومين", popular: false }
    ]
  },
  {
    title: "تقارير المركبات والصيانة",
    icon: Car,
    reports: [
      { name: "تقرير حالة المركبات", lastGenerated: "منذ 30 دقيقة", popular: true },
      { name: "تقرير الصيانة المجدولة", lastGenerated: "منذ ساعتين", popular: true },
      { name: "تقرير استهلاك الوقود", lastGenerated: "أمس", popular: false },
      { name: "تقرير تكاليف الصيانة", lastGenerated: "منذ 4 ساعات", popular: false }
    ]
  },
  {
    title: "تقارير العقود والعملاء",
    icon: FileCheck,
    reports: [
      { name: "تقرير العقود المنتهية", lastGenerated: "منذ ساعة", popular: true },
      { name: "تقرير أداء العملاء", lastGenerated: "منذ 6 ساعات", popular: false },
      { name: "تقرير التوقيعات الرقمية", lastGenerated: "أمس", popular: false },
      { name: "تقرير الدفعات المتأخرة", lastGenerated: "منذ 5 ساعات", popular: true }
    ]
  },
  {
    title: "تقارير المخزون",
    icon: Package,
    reports: [
      { name: "تقرير مستويات المخزون", lastGenerated: "منذ 2 ساعة", popular: true },
      { name: "تقرير إعادة الطلب التلقائي", lastGenerated: "منذ 4 ساعات", popular: false },
      { name: "تقرير جودة المنتجات", lastGenerated: "أمس", popular: false },
      { name: "تقرير الموردين", lastGenerated: "منذ 3 ساعات", popular: false }
    ]
  }
];

export function ReportsOverview() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">رسم بياني للإيرادات الشهرية</p>
                <p className="text-sm text-muted-foreground">567,890 ر.س إجمالي الإيرادات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              توزيع المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">رسم دائري لتوزيع المصروفات</p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>الصيانة 35%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>الوقود 25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>التأمين 20%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>أخرى 20%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            التقارير حسب الفئة
          </CardTitle>
          <CardDescription>
            جميع التقارير منظمة حسب الأقسام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {reportCategories.map((category, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {reportCategories.map((category, categoryIndex) => (
              <TabsContent key={categoryIndex} value={categoryIndex.toString()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {category.reports.map((report, reportIndex) => (
                    <Card key={reportIndex} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{report.name}</h4>
                          {report.popular && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              شائع
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Clock className="h-4 w-4" />
                          آخر إنشاء: {report.lastGenerated}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <FileText className="h-4 w-4 mr-2" />
                            عرض
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            تصدير
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            جدولة
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>
            إنشاء تقارير مخصصة وإدارة الجدولة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              إنشاء تقرير مخصص
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              إدارة الجدولة
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Download className="h-6 w-6" />
              تصدير متقدم
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}