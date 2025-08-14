
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface ContractsQuickStatsProps {
  contracts: any[];
}

export const ContractsQuickStats = ({ contracts }: ContractsQuickStatsProps) => {
  const today = new Date();
  
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    expiring: contracts.filter(c => {
      const endDate = new Date(c.end_date);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0 && c.status === 'active';
    }).length,
    completed: contracts.filter(c => c.status === 'completed').length,
    totalRevenue: contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0),
    totalPaid: contracts.reduce((sum, c) => sum + (c.paid_amount || 0), 0)
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1">
            <FileText className="h-3 w-3" />
            إجمالي العقود
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            العقود النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-green-600">{stats.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-orange-600" />
            تنتهي قريباً
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-orange-600">{stats.expiring}</div>
          <div className="text-xs text-muted-foreground">خلال 7 أيام</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-600" />
            مكتملة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-blue-600">{stats.completed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-green-600" />
            إجمالي الإيرادات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-green-600">
            {stats.totalRevenue.toLocaleString()} ر.س
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-blue-600" />
            المحصل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-blue-600">
            {stats.totalPaid.toLocaleString()} ر.س
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.totalRevenue > 0 ? 
              Math.round((stats.totalPaid / stats.totalRevenue) * 100) : 0
            }% من الإجمالي
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
