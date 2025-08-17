
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Package, Search, Calendar, User } from "lucide-react";

export const InventoryTransactionsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Mock data for now - replace with actual data fetching
  const transactions = [
    {
      id: "1",
      type: "in",
      item_name: "فلتر زيت محرك",
      quantity: 50,
      unit_cost: 25.00,
      total_cost: 1250.00,
      reference_type: "purchase_order",
      reference_number: "PO-001",
      performed_by: "أحمد محمد",
      transaction_date: "2024-01-15T10:00:00Z",
      notes: "دفعة جديدة من المورد الرئيسي"
    },
    {
      id: "2",
      type: "out",
      item_name: "زيت محرك 5W-30",
      quantity: 4,
      unit_cost: 45.00,
      total_cost: 180.00,
      reference_type: "maintenance",
      reference_number: "M-2024-015",
      performed_by: "سالم عبدالله",
      transaction_date: "2024-01-14T14:30:00Z",
      notes: "صيانة دورية للمركبة رقم 123"
    }
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = searchTerm === "" || 
      transaction.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const transactionDate = new Date(transaction.transaction_date);
      const today = new Date();
      
      switch (dateFilter) {
        case "today":
          matchesDate = transactionDate.toDateString() === today.toDateString();
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const getTransactionIcon = (type: string) => {
    return type === 'in' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTransactionLabel = (type: string) => {
    return type === 'in' ? 'إدخال' : 'إخراج';
  };

  const getTransactionColor = (type: string) => {
    return type === 'in' ? 'default' : 'secondary';
  };

  const getReferenceTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase_order': return 'أمر شراء';
      case 'maintenance': return 'صيانة';
      case 'adjustment': return 'تعديل مخزون';
      case 'return': return 'إرجاع';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          حركات المخزون ({filteredTransactions.length})
        </CardTitle>
        <CardDescription>
          تتبع جميع حركات الإدخال والإخراج للمخزون
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الحركات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الحركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحركات</SelectItem>
                <SelectItem value="in">إدخال</SelectItem>
                <SelectItem value="out">إخراج</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفترات</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">آخر شهر</SelectItem>
              </SelectContent>
            </Select>

            <Button>
              <TrendingUp className="h-4 w-4 mr-2" />
              إضافة حركة
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد حركات تطابق معايير البحث</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <h3 className="font-medium">{transaction.item_name}</h3>
                      <Badge variant={getTransactionColor(transaction.type) as any}>
                        {getTransactionLabel(transaction.type)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {getReferenceTypeLabel(transaction.reference_type)}: {transaction.reference_number}
                    </div>
                    
                    {transaction.notes && (
                      <p className="text-sm text-muted-foreground">
                        الملاحظات: {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>الكمية: {transaction.quantity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(transaction.transaction_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{transaction.performed_by}</span>
                  </div>
                  
                  <div className="font-medium">
                    الإجمالي: {transaction.total_cost.toFixed(2)} ر.س
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
