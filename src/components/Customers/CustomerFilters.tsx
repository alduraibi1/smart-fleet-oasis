import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  ratingFilter: string;
  onRatingChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  documentFilter: string;
  onDocumentChange: (value: string) => void;
  blacklistFilter: string;
  onBlacklistChange: (value: string) => void;
}

export const CustomerFilters = ({
  searchTerm,
  onSearchChange,
  ratingFilter,
  onRatingChange,
  statusFilter,
  onStatusChange,
  documentFilter,
  onDocumentChange,
  blacklistFilter,
  onBlacklistChange
}: CustomerFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث بالاسم أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            <Select value={ratingFilter} onValueChange={onRatingChange}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="فلترة بالتقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التقييمات</SelectItem>
                <SelectItem value="5">5 نجوم</SelectItem>
                <SelectItem value="4">4 نجوم فأكثر</SelectItem>
                <SelectItem value="3">3 نجوم فأكثر</SelectItem>
                <SelectItem value="2">نجمتان فأكثر</SelectItem>
                <SelectItem value="1">نجمة واحدة فأكثر</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="حالة النشاط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العملاء</SelectItem>
                <SelectItem value="active">عملاء نشطين</SelectItem>
                <SelectItem value="inactive">عملاء غير نشطين</SelectItem>
              </SelectContent>
            </Select>

            <Select value={documentFilter} onValueChange={onDocumentChange}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="حالة المستندات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستندات</SelectItem>
                <SelectItem value="valid">مستندات صالحة</SelectItem>
                <SelectItem value="expiring">تنتهي قريباً</SelectItem>
                <SelectItem value="expired">منتهية الصلاحية</SelectItem>
              </SelectContent>
            </Select>

            <Select value={blacklistFilter} onValueChange={onBlacklistChange}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="القائمة السوداء" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العملاء</SelectItem>
                <SelectItem value="normal">عملاء عاديين</SelectItem>
                <SelectItem value="blacklisted">قائمة سوداء</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};