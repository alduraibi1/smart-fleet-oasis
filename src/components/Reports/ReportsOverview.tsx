import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  Package, 
  FileText, 
  DollarSign,
  Calendar,
  Download,
  Eye
} from "lucide-react";
import InventoryReports from "../Inventory/InventoryReports";
import { DynamicReportGenerator } from "./DynamicReportGenerator";

export const ReportsOverview = () => {
  const [activeTab, setActiveTab] = useState("generator");

  const reportCategories = [
    {
      id: "generator",
      title: "مولد التقارير الديناميكي",
      description: "إنشاء تقارير مخصصة بفلاتر متقدمة",
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      id: "financial",
      title: "التقارير المالية",
      description: "تقارير الإيرادات والمصروفات والأرباح",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      id: "vehicles",
      title: "تقارير المركبات",
      description: "أداء وربحية المركبات",
      icon: Car,
      color: "text-purple-600"
    },
    {
      id: "inventory",
      title: "تقارير المخزون",
      description: "حركة المخزون والمبيعات",
      icon: Package,
      color: "text-orange-600"
    }
  ];

  const financialReports = [
    {
      title: "تقرير الإيرادات الشهرية",
      description: "ملخص الإيرادات والمقارنات الشهرية",
      icon: TrendingUp,
      value: "245,000 ريال",
      change: "+12.5%",
      trend: "up"
    },
    {
      title: "تقرير المصروفات",
      description: "تفاصيل المصروفات والتكاليف التشغيلية",
      icon: TrendingUp,
      value: "89,500 ريال",
      change: "-3.2%",
      trend: "down"
    },
    {
      title: "تقرير الأرباح والخسائر",
      description: "صافي الأرباح وهوامش الربح",
      icon: DollarSign,
      value: "155,500 ريال",
      change: "+18.7%",
      trend: "up"
    },
    {
      title: "تقرير التدفق النقدي",
      description: "حركة النقد الداخل والخارج",
      icon: Calendar,
      value: "67,200 ريال",
      change: "+5.4%",
      trend: "up"
    }
  ];

  const vehicleReports = [
    {
      title: "تقرير أداء المركبات",
      description: "معدل الاستخدام والإيرادات لكل مركبة",
      icon: Car,
      value: "85% معدل استخدام",
      change: "+7.2%",
      trend: "up"
    },
    {
      title: "تقرير الصيانة",
      description: "تكاليف وجدولة الصيانة",
      icon: FileText,
      value: "23,400 ريال",
      change: "-12.1%",
      trend: "down"
    },
    {
      title: "تقرير الوقود",
      description: "استهلاك الوقود والتكاليف",
      icon: TrendingUp,
      value: "15,600 ريال",
      change: "+4.8%",
      trend: "up"
    },
    {
      title: "تقرير التأمين",
      description: "تكاليف التأمين والمطالبات",
      icon: Users,
      value: "12,800 ريال",
      change: "+2.1%",
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`p-4 text-right rounded-lg border transition-all duration-200 ${
                    activeTab === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${category.color}`} />
                    <div>
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Report Content */}
      {activeTab === "generator" && <DynamicReportGenerator />}
      
      {activeTab === "financial" && (
        <div className="grid gap-6 md:grid-cols-2">
          {financialReports.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {report.title}
                    </div>
                    <Badge variant={report.trend === "up" ? "default" : "secondary"}>
                      {report.change}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{report.value}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        تصدير
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "vehicles" && (
        <div className="grid gap-6 md:grid-cols-2">
          {vehicleReports.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {report.title}
                    </div>
                    <Badge variant={report.trend === "up" ? "default" : "secondary"}>
                      {report.change}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{report.value}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        تصدير
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "inventory" && <InventoryReports />}
    </div>
  );
};
