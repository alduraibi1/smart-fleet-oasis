
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CashFlowData {
  period: string;
  revenue: number;
  expenses: number;
  netFlow: number;
  runningBalance: number;
}

interface CashFlowChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

export function CashFlowChart({ period }: CashFlowChartProps) {
  const [data, setData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashFlowData = async () => {
      setLoading(true);
      
      // محاكاة البيانات (في التطبيق الحقيقي ستأتي من قاعدة البيانات)
      const mockData: CashFlowData[] = [];
      let runningBalance = 50000; // رصيد ابتدائي
      
      const periods = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
      const periodName = period === 'week' ? 'يوم' : period === 'month' ? 'أسبوع' : period === 'quarter' ? 'شهر' : 'ربع';
      
      for (let i = 0; i < (period === 'week' ? 7 : period === 'month' ? 4 : period === 'quarter' ? 3 : 4); i++) {
        const revenue = Math.random() * 15000 + 5000;
        const expenses = Math.random() * 8000 + 2000;
        const netFlow = revenue - expenses;
        runningBalance += netFlow;
        
        mockData.push({
          period: `${periodName} ${i + 1}`,
          revenue: Math.round(revenue),
          expenses: Math.round(expenses),
          netFlow: Math.round(netFlow),
          runningBalance: Math.round(runningBalance)
        });
      }
      
      setData(mockData);
      setLoading(false);
    };

    fetchCashFlowData();
  }, [period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تحليل التدفق النقدي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            جاري التحميل...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>الإيرادات والمصروفات</CardTitle>
          <CardDescription>مقارنة التدفقات النقدية الداخلة والخارجة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}ك`} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'revenue' ? 'الإيرادات' : name === 'expenses' ? 'المصروفات' : 'صافي التدفق'
                ]}
                labelFormatter={(label) => `الفترة: ${label}`}
              />
              <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
              <Bar dataKey="expenses" fill="#ef4444" name="المصروفات" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الرصيد التراكمي</CardTitle>
          <CardDescription>تطور الرصيد النقدي عبر الفترة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}ك`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'الرصيد التراكمي']}
                labelFormatter={(label) => `الفترة: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="runningBalance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
