
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Download, RefreshCw, TrendingUp, BarChart3, Users, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVehicles } from "@/hooks/useVehicles";
import { useCustomers } from "@/hooks/useCustomers";
import { useOwners } from "@/hooks/useOwners";
import { FinancialSummaryReport } from "./FinancialSummaryReport";
import { VehiclePerformanceReport } from "./VehiclePerformanceReport";
import { CustomerAnalysisReport } from "./CustomerAnalysisReport";
import { MaintenanceReportComponent } from "./MaintenanceReportComponent";
import { TrendsReport } from "./TrendsReport";

type ReportType = 'financial' | 'vehicles' | 'customers' | 'maintenance' | 'trends';

export function DynamicReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { vehicles } = useVehicles();
  const { customers } = useCustomers();
  const { owners } = useOwners();

  const reportTypes = [
    { 
      value: 'financial', 
      label: 'التقرير المالي الشامل', 
      icon: TrendingUp,
      description: 'ملخص شامل للإيرادات والمصروفات والأرباح'
    },
    { 
      value: 'vehicles', 
      label: 'تقرير أداء المركبات', 
      icon: Car,
      description: 'تحليل مفصل لأداء وربحية كل مركبة'
    },
    { 
      value: 'customers', 
      label: 'تحليل العملاء', 
      icon: Users,
      description: 'تقرير شامل عن سلوك وقيمة العملاء'
    },
    { 
      value: 'maintenance', 
      label: 'تقرير الصيانة', 
      icon: BarChart3,
      description: 'تحليل تكاليف وأنماط الصيانة'
    },
    { 
      value: 'trends', 
      label: 'تقرير الاتجاهات', 
      icon: TrendingUp,
      description: 'تحليل الاتجاهات الشهرية والموسمية'
    }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // محاكاة وقت التحميل
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  const getFilters = () => ({
    startDate: dateRange?.from || new Date(),
    endDate: dateRange?.to || new Date(),
    vehicleId: selectedVehicle || undefined,
    customerId: selectedCustomer || undefined,
    ownerId: selectedOwner || undefined
  });

  const renderReport = () => {
    const filters = getFilters();
    
    switch (reportType) {
      case 'financial':
        return <FinancialSummaryReport filters={filters} />;
      case 'vehicles':
        return <VehiclePerformanceReport filters={filters} />;
      case 'customers':
        return <CustomerAnalysisReport filters={filters} />;
      case 'maintenance':
        return <MaintenanceReportComponent filters={filters} />;
      case 'trends':
        return <TrendsReport />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            مولد التقارير الديناميكي
          </CardTitle>
          <CardDescription>
            اختر نوع التقرير والفلاتر المطلوبة لإنشاء تقرير مخصص
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Report Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التقرير</label>
              <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      "اختر الفترة الزمنية"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Vehicle Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">المركبة (اختياري)</label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المركبات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع المركبات</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate_number} - {vehicle.brand} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">العميل (اختياري)</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع العملاء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع العملاء</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              إنشاء التقرير
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير PDF
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report */}
      {renderReport()}
    </div>
  );
}
