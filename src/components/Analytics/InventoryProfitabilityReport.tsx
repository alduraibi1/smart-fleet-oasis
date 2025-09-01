import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Package, BarChart3, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ItemProfitability {
  item_id: string;
  item_name: string;
  category: string;
  total_purchased: number;
  total_cost: number;
  total_consumed: number;
  consumption_cost: number;
  unit_cost: number;
  usage_efficiency: number;
  cost_per_service: number;
  profitability_score: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface CategoryAnalysis {
  category: string;
  total_items: number;
  total_investment: number;
  total_consumption: number;
  efficiency_rate: number;
  avg_profitability: number;
}

export const InventoryProfitabilityReport = () => {
  const [itemProfitability, setItemProfitability] = useState<ItemProfitability[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'profitability' | 'efficiency' | 'cost'>('profitability');
  const { toast } = useToast();

  useEffect(() => {
    fetchProfitabilityData();
  }, []);

  const fetchProfitabilityData = async () => {
    try {
      setLoading(true);

      // Get inventory items with their categories
      const { data: inventoryItems, error: inventoryError } = await supabase
        .from('inventory_items')
        .select(`
          id,
          name,
          unit_cost,
          current_stock,
          inventory_categories(name)
        `)
        .eq('is_active', true);

      // Get parts usage
      const { data: partsUsage, error: partsError } = await supabase
        .from('maintenance_parts_used')
        .select(`
          inventory_item_id,
          quantity_used,
          unit_cost,
          total_cost,
          created_at
        `);

      // Get oils usage
      const { data: oilsUsage, error: oilsError } = await supabase
        .from('maintenance_oils_used')
        .select(`
          inventory_item_id,
          quantity_used,
          unit_cost,
          total_cost,
          created_at
        `);

      // Get stock transactions for purchase data
      const { data: stockTransactions, error: stockError } = await supabase
        .from('stock_transactions')
        .select(`
          item_id,
          quantity,
          unit_cost,
          total_cost,
          transaction_type
        `)
        .eq('transaction_type', 'in');

      if (inventoryError || partsError || oilsError || stockError) {
        throw inventoryError || partsError || oilsError || stockError;
      }

      const allUsage = [...(partsUsage || []), ...(oilsUsage || [])];
      
      const processedData = processProfitabilityData(
        inventoryItems || [],
        allUsage,
        stockTransactions || []
      );

      const categoryData = processCategoryAnalysis(processedData);

      setItemProfitability(processedData);
      setCategoryAnalysis(categoryData);
    } catch (error) {
      console.error('Error fetching profitability data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل تقرير الربحية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processProfitabilityData = (
    items: any[],
    usage: any[],
    purchases: any[]
  ): ItemProfitability[] => {
    return items.map(item => {
      const itemUsage = usage.filter(u => u.inventory_item_id === item.id);
      const itemPurchases = purchases.filter(p => p.item_id === item.id);

      const totalPurchased = itemPurchases.reduce((sum, p) => sum + p.quantity, 0);
      const totalCost = itemPurchases.reduce((sum, p) => sum + p.total_cost, 0);
      const totalConsumed = itemUsage.reduce((sum, u) => sum + u.quantity_used, 0);
      const consumptionCost = itemUsage.reduce((sum, u) => sum + u.total_cost, 0);

      const usageEfficiency = totalPurchased > 0 ? (totalConsumed / totalPurchased) * 100 : 0;
      const costPerService = totalConsumed > 0 ? consumptionCost / itemUsage.length : 0;
      
      // Calculate profitability score (0-100)
      const profitabilityScore = calculateProfitabilityScore({
        efficiency: usageEfficiency,
        costEffectiveness: item.unit_cost > 0 ? (costPerService / item.unit_cost) : 0,
        turnoverRate: totalConsumed / Math.max(item.current_stock, 1)
      });

      const trend = calculateTrend(itemUsage);

      return {
        item_id: item.id,
        item_name: item.name,
        category: item.inventory_categories?.name || 'غير محدد',
        total_purchased: totalPurchased,
        total_cost: totalCost,
        total_consumed: totalConsumed,
        consumption_cost: consumptionCost,
        unit_cost: item.unit_cost,
        usage_efficiency: usageEfficiency,
        cost_per_service: costPerService,
        profitability_score: profitabilityScore,
        trend: trend
      };
    });
  };

  const calculateProfitabilityScore = (metrics: {
    efficiency: number;
    costEffectiveness: number;
    turnoverRate: number;
  }) => {
    const efficiencyScore = Math.min(metrics.efficiency, 100) * 0.4;
    const costScore = (100 - Math.min(metrics.costEffectiveness * 10, 100)) * 0.3;
    const turnoverScore = Math.min(metrics.turnoverRate * 20, 100) * 0.3;
    
    return Math.round(efficiencyScore + costScore + turnoverScore);
  };

  const calculateTrend = (usage: any[]): 'improving' | 'declining' | 'stable' => {
    if (usage.length < 4) return 'stable';
    
    const recent = usage.slice(-2).reduce((sum, u) => sum + u.quantity_used, 0) / 2;
    const previous = usage.slice(-4, -2).reduce((sum, u) => sum + u.quantity_used, 0) / 2;
    
    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    
    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  };

  const processCategoryAnalysis = (items: ItemProfitability[]): CategoryAnalysis[] => {
    const categories = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          category: item.category,
          items: [],
          total_investment: 0,
          total_consumption: 0
        };
      }
      acc[item.category].items.push(item);
      acc[item.category].total_investment += item.total_cost;
      acc[item.category].total_consumption += item.consumption_cost;
      return acc;
    }, {} as any);

    return Object.values(categories).map((cat: any) => ({
      category: cat.category,
      total_items: cat.items.length,
      total_investment: cat.total_investment,
      total_consumption: cat.total_consumption,
      efficiency_rate: cat.items.reduce((sum: number, item: any) => sum + item.usage_efficiency, 0) / cat.items.length,
      avg_profitability: cat.items.reduce((sum: number, item: any) => sum + item.profitability_score, 0) / cat.items.length
    }));
  };

  const getFilteredItems = () => {
    let filtered = selectedCategory === 'all' 
      ? itemProfitability 
      : itemProfitability.filter(item => item.category === selectedCategory);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'profitability':
          return b.profitability_score - a.profitability_score;
        case 'efficiency':
          return b.usage_efficiency - a.usage_efficiency;
        case 'cost':
          return b.consumption_cost - a.consumption_cost;
        default:
          return 0;
      }
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getProfitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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

  const totalInvestment = categoryAnalysis.reduce((sum, cat) => sum + cat.total_investment, 0);
  const totalConsumption = categoryAnalysis.reduce((sum, cat) => sum + cat.total_consumption, 0);
  const avgEfficiency = categoryAnalysis.reduce((sum, cat) => sum + cat.efficiency_rate, 0) / categoryAnalysis.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقرير ربحية المخزون</h2>
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categoryAnalysis.map(cat => (
                <SelectItem key={cat.category} value={cat.category}>
                  {cat.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profitability">درجة الربحية</SelectItem>
              <SelectItem value="efficiency">كفاءة الاستخدام</SelectItem>
              <SelectItem value="cost">التكلفة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الاستثمار</p>
                <p className="text-2xl font-bold">{totalInvestment.toLocaleString()} ر.س</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الاستهلاك</p>
                <p className="text-2xl font-bold">{totalConsumption.toLocaleString()} ر.س</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط الكفاءة</p>
                <p className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">معدل الاستخدام</p>
                <p className="text-2xl font-bold">
                  {totalInvestment > 0 ? ((totalConsumption / totalInvestment) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">تفاصيل العناصر</TabsTrigger>
          <TabsTrigger value="categories">تحليل الفئات</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="grid gap-4">
            {getFilteredItems().map((item) => (
              <Card key={item.item_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.item_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(item.trend)}
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">درجة الربحية</p>
                      <p className={`text-xl font-bold ${getProfitabilityColor(item.profitability_score)}`}>
                        {item.profitability_score}/100
                      </p>
                      <Progress value={item.profitability_score} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">كفاءة الاستخدام</p>
                      <p className="text-xl font-bold">{item.usage_efficiency.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">التكلفة الإجمالية</p>
                      <p className="text-xl font-bold">{item.total_cost.toLocaleString()} ر.س</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تكلفة الاستهلاك</p>
                      <p className="text-xl font-bold">{item.consumption_cost.toLocaleString()} ر.س</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تكلفة الخدمة</p>
                      <p className="text-xl font-bold">{item.cost_per_service.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categoryAnalysis.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">عدد العناصر</p>
                      <p className="text-xl font-bold">{category.total_items}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الاستثمار</p>
                      <p className="text-xl font-bold">{category.total_investment.toLocaleString()} ر.س</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">متوسط الكفاءة</p>
                      <p className="text-xl font-bold">{category.efficiency_rate.toFixed(1)}%</p>
                      <Progress value={category.efficiency_rate} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">متوسط الربحية</p>
                      <p className={`text-xl font-bold ${getProfitabilityColor(category.avg_profitability)}`}>
                        {category.avg_profitability.toFixed(0)}/100
                      </p>
                      <Progress value={category.avg_profitability} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};