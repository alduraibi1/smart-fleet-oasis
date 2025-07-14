import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { OwnerFilters as OwnerFiltersType } from "@/hooks/useOwners";

interface OwnerFiltersProps {
  onFiltersChange: (filters: OwnerFiltersType) => void;
}

export const OwnerFilters = ({ onFiltersChange }: OwnerFiltersProps) => {
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<string>("all");

  const handleSearch = () => {
    const filters: OwnerFiltersType = {};
    
    if (search.trim()) {
      filters.search = search.trim();
    }
    
    if (isActive !== "all") {
      filters.is_active = isActive === "active";
    }

    onFiltersChange(filters);
  };

  const handleClear = () => {
    setSearch("");
    setIsActive("all");
    onFiltersChange({});
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث بالاسم، البريد الإلكتروني، الهاتف، أو رقم الهوية..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              بحث
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />
              مسح
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};