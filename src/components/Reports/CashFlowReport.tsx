import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, TrendingUp, TrendingDown, Download, Eye, DollarSign, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";

interface CashFlowData {
  period: string;
  openingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  closingBalance: number;
  inflows: {
    rental: number;
    deposits: number;
    otherIncome: number;
  };
  outflows: {
    maintenance: number;
    salaries: number;
    ownerPayments: number;
    insurance: number;
    fuel: number;
    other: number;
  };
}

export function CashFlowReport() {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);

  // Mock data for demonstration
  const mockCashFlowData: CashFlowData[] = [
    {
      period: "يناير 2024",
      openingBalance: 50000,
      totalInflows: 120000,
      totalOutflows: 85000,
      netCashFlow: 35000,
      closingBalance: 85000,
      inflows: {
        rental: 100000,
        deposits: 15000,
        otherIncome: 5000
      },
      outflows: {
        maintenance: 25000,
        salaries: 20000,
        ownerPayments: 30000,
        insurance: 5000,
        fuel: 3000,
        other: 2000
      }
    },
    {
      period: "فبراير 2024",
      openingBalance: 85000,
      totalInflows: 130000,
      totalOutflows: 90000,
      netCashFlow: 40000,
      closingBalance: 125000,
      inflows: {
        rental: 110000,
        deposits: 12000,
        otherIncome: 8000
      },
      outflows: {
        maintenance: 28000,
        salaries: 20000,
        ownerPayments: 32000,
        insurance: 5000,
        fuel: 3500,
        other: 1500
      }
    },
    {
      period: "مارس 2024",
      openingBalance: 125000,
      totalInflows: 140000,
      totalOutflows: 95000,
      netCashFlow: 45000,
      closingBalance: 170000,
      inflows: {
        rental: 115000,
        deposits: 18000,
        otherIncome: 7000
      },
      outflows: {
        maintenance: 30000,
        salaries: 20000,
        ownerPayments: 35000,
        insurance: 5000,
        fuel: 3000,
        other: 2000
      }
    }
  ];

  useEffect(() => {
    setCashFlowData(mockCashFlowData);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const chartData = cashFlowData.map(data => ({
    period: data.period,
    inflows: data.totalInflows,
    outflows: data.totalOutflows,
    netFlow: data.netCashFlow,
    balance: data.closingBalance
  }));

  const currentPeriod = cashFlowData[cashFlowData.length - 1] || mockCashFlowData[0];
  const previousPeriod = cashFlowData[cashFlowData.length - 2];
  
  const inflowChange = previousPeriod 
    ? ((currentPeriod.totalInflows - previousPeriod.totalInflows) / previousPeriod.totalInflows) * 100
    : 0;
    
  const outflowChange = previousPeriod 
    ? ((currentPeriod.totalOutflows - previousPeriod.totalOutflows) / previousPeriod.totalOutflows) * 100
    : 0;

  const inflowBreakdownData = [
    { name: "إيرادات الإيجار", value: currentPeriod.inflows.rental, color: "#10B981" },
    { name: "التأمينات", value: currentPeriod.inflows.deposits, color: "#3B82F6" },
    { name: "إيرادات أخرى", value: currentPeriod.inflows.otherIncome, color: "#8B5CF6" }
  ];

  const outflowBreakdownData = [
    { name: "صيانة", value: currentPeriod.outflows.maintenance, color: "#EF4444" },
    { name: "رواتب", value: currentPeriod.outflows.salaries, color: "#F59E0B" },
    { name: "مدفوعات المالكين", value: currentPeriod.outflows.ownerPayments, color: "#EC4899" },
    { name: "تأمين", value: currentPeriod.outflows.insurance, color: "#6B7280" },
    { name: "وقود", value: currentPeriod.outflows.fuel, color: "#14B8A6" },
    { name: "أخرى", value: currentPeriod.outflows.other, color: "#A855F7" }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            تقرير التدفق النقدي
          </CardTitle>
          <CardDescription>
            تحليل مفصل للتدفقات النقدية الداخلة والخارجة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>من تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>إلى تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>نوع الفترة</Label>
              <Select value={periodType} onValueChange={(value: "daily" | "weekly" | "monthly") => setPeriodType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button className="flex-1">
                <Eye className="h-4 w-4 ml-2" />
                عرض التقرير
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التدفقات الداخلة</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentPeriod.totalInflows)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {inflowChange >= 0 ? (
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${inflowChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(inflowChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التدفقات الخارجة</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(currentPeriod.totalOutflows)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {outflowChange >= 0 ? (
                    <ArrowUpCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-sm ${outflowChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(outflowChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي التدفق النقدي</p>
                <p className={`text-2xl font-bold ${currentPeriod.netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(currentPeriod.netCashFlow)}
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${currentPeriod.netCashFlow >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الرصيد الختامي</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(currentPeriod.closingBalance)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>اتجاه التدفق النقدي</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ textAlign: 'right' }}
                />
                <Area type="monotone" dataKey="inflows" stackId="1" stroke="#10B981" fill="#10B981" name="التدفقات الداخلة" />
                <Area type="monotone" dataKey="outflows" stackId="2" stroke="#EF4444" fill="#EF4444" name="التدفقات الخارجة" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الرصيد النقدي</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ textAlign: 'right' }}
                />
                <Line type="monotone" dataKey="balance" stroke="#8B5CF6" strokeWidth={3} name="الرصيد" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
              تفصيل التدفقات الداخلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inflowBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((item.value / currentPeriod.totalInflows) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
              تفصيل التدفقات الخارجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outflowBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((item.value / currentPeriod.totalOutflows) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cash Flow Statement */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة التدفق النقدي التفصيلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">الفترة</th>
                  <th className="text-right p-3 font-medium">الرصيد الافتتاحي</th>
                  <th className="text-right p-3 font-medium">التدفقات الداخلة</th>
                  <th className="text-right p-3 font-medium">التدفقات الخارجة</th>
                  <th className="text-right p-3 font-medium">صافي التدفق</th>
                  <th className="text-right p-3 font-medium">الرصيد الختامي</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((data, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{data.period}</td>
                    <td className="p-3">{formatCurrency(data.openingBalance)}</td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(data.totalInflows)}</td>
                    <td className="p-3 font-bold text-red-600">{formatCurrency(data.totalOutflows)}</td>
                    <td className="p-3">
                      <Badge variant={data.netCashFlow >= 0 ? "default" : "destructive"}>
                        {formatCurrency(data.netCashFlow)}
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-blue-600">{formatCurrency(data.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}