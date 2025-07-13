import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MaintenanceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  mechanicFilter: string;
  onMechanicChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
}

export function MaintenanceFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  mechanicFilter,
  onMechanicChange,
  dateFilter,
  onDateChange
}: MaintenanceFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          البحث والتصفية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث برقم اللوحة أو رقم الصيانة..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="حالة الصيانة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">معلقة</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
              <SelectItem value="cancelled">ملغية</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="نوع الصيانة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="scheduled">دورية</SelectItem>
              <SelectItem value="breakdown">طارئة</SelectItem>
              <SelectItem value="inspection">فحص</SelectItem>
            </SelectContent>
          </Select>

          {/* Mechanic Filter */}
          <Select value={mechanicFilter} onValueChange={onMechanicChange}>
            <SelectTrigger>
              <SelectValue placeholder="الميكانيكي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الميكانيكيين</SelectItem>
              <SelectItem value="mechanic1">أحمد محمد</SelectItem>
              <SelectItem value="mechanic2">خالد عبدالله</SelectItem>
              <SelectItem value="mechanic3">محمد علي</SelectItem>
              <SelectItem value="mechanic4">سعد الشمري</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={onDateChange}>
            <SelectTrigger>
              <SelectValue placeholder="فترة زمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفترات</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}