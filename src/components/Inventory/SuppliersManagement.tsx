
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building2, Phone, Mail } from "lucide-react";

const SuppliersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock suppliers data
  const suppliers = [
    {
      id: 1,
      name: "شركة قطع الغيار المتطورة",
      contact: "أحمد محمد",
      phone: "+966501234567",
      email: "contact@advanced-parts.com",
      status: "نشط",
      orders: 25
    },
    {
      id: 2,
      name: "مؤسسة الزيوت والفلاتر",
      contact: "فاطمة علي",
      phone: "+966507654321",
      email: "info@oils-filters.com",
      status: "نشط",
      orders: 18
    }
  ];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الموردين</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة مورد
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الموردين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {supplier.name}
                </div>
                <Badge variant={supplier.status === "نشط" ? "default" : "secondary"}>
                  {supplier.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">جهة الاتصال:</span>
                {supplier.contact}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {supplier.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {supplier.email}
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">الطلبات:</span>
                  <Badge variant="outline">{supplier.orders}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuppliersManagement;
