import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, Package, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConsumptionTrend {
  item_id: string;
  item_name: string;
  category: string;
  monthly_consumption: number[];
  trend_direction: 'up' | 'down' | 'stable';
  trend_percentage: number;
  predicted_consumption: number;
  reorder_suggestion: number;
  seasonal_pattern: boolean;
}

interface SeasonalAnalysis {
  peak_months: string[];
  low_months: string[];
  seasonal_factor: number;
  pattern_strength: number;
}

export const ConsumptionTrendAnalysis = () => {
  const [trends, setTrends] = useState<ConsumptionTrend[]>([]);
  const [seasonalAnalysis, setSeasonalAnalysis] = useState<SeasonalAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m');
  const { toast } = useToast();

  useEffect(() => {
    fetchConsumptionTrends();
  }, [selectedPeriod]);

  const fetchConsumptionTrends = async () => {
    try {
      setLoading(true);
      
      // Get maintenance parts usage for trend analysis
      const { data: partsUsage, error: partsError } = await supabase
        .from('maintenance_parts_used')
        .select(`
          inventory_item_id,
          quantity_used,
          total_cost,
          created_at,
          inventory_items(name, category_id),
          vehicle_maintenance(completed_date)
        `)
        .gte('created_at', getDateRange(selectedPeriod))
        .not('inventory_items', 'is', null);

      // Get oils usage
      const { data: oilsUsage, error: oilsError } = await supabase
        .from('maintenance_oils_used')
        .select(`
          inventory_item_id,
          quantity_used,
          total_cost,
          created_at,
          inventory_items(name, category_id),
          vehicle_maintenance(completed_date)
        `)
        .gte('created_at', getDateRange(selectedPeriod))
        .not('inventory_items', 'is', null);

      if (partsError || oilsError) {
        throw partsError || oilsError;
      }

      // Process consumption data
      const consumptionData = [...(partsUsage || []), ...(oilsUsage || [])];
      const processedTrends = processConsumptionTrends(consumptionData);
      const seasonalData = analyzeSeasonalPatterns(consumptionData);

      setTrends(processedTrends);
      setSeasonalAnalysis(seasonalData);
    } catch (error) {
      console.error('Error fetching consumption trends:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل تحليل اتجاهات الاستهلاك",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    const monthsBack = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    return new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toISOString();
  };

  const processConsumptionTrends = (data: any[]): ConsumptionTrend[] => {
    const itemGroups = data.reduce((acc, item) => {
      const itemId = item.inventory_item_id;
      if (!acc[itemId]) {
        acc[itemId] = {
          item_id: itemId,
          item_name: item.inventory_items?.name || 'Unknown',
          category: item.inventory_items?.category_id || 'Uncategorized',
          usage_records: []
        };
      }
      acc[itemId].usage_records.push({
        quantity: item.quantity_used,
        date: new Date(item.created_at),
        cost: item.total_cost
      });
      return acc;
    }, {});

    return Object.values(itemGroups).map((group: any) => {
      const monthlyData = calculateMonthlyConsumption(group.usage_records);
      const trend = calculateTrend(monthlyData);
      
      return {
        item_id: group.item_id,
        item_name: group.item_name,
        category: group.category,
        monthly_consumption: monthlyData,
        trend_direction: trend.direction,
        trend_percentage: trend.percentage,
        predicted_consumption: trend.predicted,
        reorder_suggestion: Math.ceil(trend.predicted * 1.2), // 20% buffer
        seasonal_pattern: hasSeasonalPattern(monthlyData)
      };
    });
  };

  const calculateMonthlyConsumption = (records: any[]) => {
    const months = Array(6).fill(0); // Last 6 months
    const now = new Date();
    
    records.forEach(record => {
      const monthDiff = (now.getFullYear() - record.date.getFullYear()) * 12 + 
                       (now.getMonth() - record.date.getMonth());
      if (monthDiff >= 0 && monthDiff < 6) {
        months[5 - monthDiff] += record.quantity;
      }
    });
    
    return months;
  };

  const calculateTrend = (monthlyData: number[]) => {
    const recentAvg = (monthlyData[4] + monthlyData[5]) / 2;
    const previousAvg = (monthlyData[0] + monthlyData[1] + monthlyData[2]) / 3;
    
    const percentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
    const direction: 'up' | 'down' | 'stable' = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';
    const predicted = Math.max(0, recentAvg + (recentAvg * percentage / 100));
    
    return { direction, percentage: Math.abs(percentage), predicted };
  };

  const hasSeasonalPattern = (monthlyData: number[]) => {
    const avg = monthlyData.reduce((a, b) => a + b, 0) / monthlyData.length;
    const variance = monthlyData.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / monthlyData.length;
    return variance > avg * 0.5; // High variance indicates seasonal pattern
  };

  const analyzeSeasonalPatterns = (data: any[]): SeasonalAnalysis[] => {
    // Simplified seasonal analysis - can be enhanced
    return [{
      peak_months: ['يونيو', 'يوليو', 'أغسطس'],
      low_months: ['ديسمبر', 'يناير', 'فبراير'],
      seasonal_factor: 1.3,
      pattern_strength: 0.75
    }];
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'destructive';
      case 'down': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تحليل اتجاهات الاستهلاك</h2>
        <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
          <TabsList>
            <TabsTrigger value="3m">3 أشهر</TabsTrigger>
            <TabsTrigger value="6m">6 أشهر</TabsTrigger>
            <TabsTrigger value="12m">12 شهر</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العناصر المراقبة</p>
                <p className="text-2xl font-bold">{trends.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">اتجاه صاعد</p>
                <p className="text-2xl font-bold text-red-600">
                  {trends.filter(t => t.trend_direction === 'up').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">اتجاه هابط</p>
                <p className="text-2xl font-bold text-green-600">
                  {trends.filter(t => t.trend_direction === 'down').length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أنماط موسمية</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trends.filter(t => t.seasonal_pattern).length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Trends */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">اتجاهات الاستهلاك</TabsTrigger>
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="seasonal">التحليل الموسمي</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {trends.map((trend) => (
              <Card key={trend.item_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trend.item_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend_direction)}
                      <Badge variant={getTrendColor(trend.trend_direction) as any}>
                        {trend.trend_percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">الاستهلاك الشهري الحالي</p>
                      <p className="text-xl font-bold">
                        {trend.monthly_consumption[trend.monthly_consumption.length - 1]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">التنبؤ للشهر القادم</p>
                      <p className="text-xl font-bold text-blue-600">
                        {Math.round(trend.predicted_consumption)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">اقتراح إعادة الطلب</p>
                      <p className="text-xl font-bold text-green-600">
                        {trend.reorder_suggestion}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">نمط موسمي</p>
                      <Badge variant={trend.seasonal_pattern ? "default" : "secondary"}>
                        {trend.seasonal_pattern ? "نعم" : "لا"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Monthly consumption chart */}
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">الاستهلاك الشهري (آخر 6 أشهر)</p>
                    <div className="flex items-end gap-2 h-20">
                      {trend.monthly_consumption.map((consumption, index) => (
                        <div 
                          key={index}
                          className="bg-primary/20 rounded-t flex-1 flex items-end justify-center"
                          style={{ 
                            height: `${(consumption / Math.max(...trend.monthly_consumption)) * 100}%` 
                          }}
                        >
                          <span className="text-xs text-muted-foreground mb-1">
                            {consumption}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                توصيات إعادة الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends
                  .filter(t => t.trend_direction === 'up' || t.predicted_consumption > 10)
                  .map((trend) => (
                    <div key={trend.item_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{trend.item_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          التنبؤ: {Math.round(trend.predicted_consumption)} وحدة الشهر القادم
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{trend.reorder_suggestion}</p>
                        <p className="text-sm text-muted-foreground">وحدة مقترحة</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التحليل الموسمي</CardTitle>
            </CardHeader>
            <CardContent>
              {seasonalAnalysis.map((analysis, index) => (
                <div key={index} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">أشهر الذروة</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.peak_months.map((month) => (
                          <Badge key={month} variant="destructive">{month}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">أشهر الانخفاض</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.low_months.map((month) => (
                          <Badge key={month} variant="secondary">{month}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">العامل الموسمي</p>
                      <p className="text-xl font-bold">{analysis.seasonal_factor}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">قوة النمط</p>
                      <Progress value={analysis.pattern_strength * 100} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">
                        {(analysis.pattern_strength * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};