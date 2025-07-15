import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuppliers } from "@/hooks/useSuppliers";
import { AddSupplierDialog } from "./AddSupplierDialog";
import { Edit, Trash2, Star, Phone, Mail } from "lucide-react";

export const SuppliersTable = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { suppliers, deleteSupplier, updateSupplierRating } = useSuppliers();

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      await deleteSupplier(id);
    }
  };

  const renderStars = (rating: number | null) => {
    const stars = [];
    const ratingValue = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>قائمة الموردين</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            إضافة مورد جديد
          </Button>
        </div>
        <CardDescription>إدارة جميع الموردين والبائعين</CardDescription>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد موردين</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4">
              إضافة أول مورد
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المورد</TableHead>
                <TableHead>الشخص المسؤول</TableHead>
                <TableHead>التواصل</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    {supplier.name}
                  </TableCell>
                  <TableCell>
                    {supplier.contact_person || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {supplier.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {supplier.email}
                        </div>
                      )}
                      {!supplier.phone && !supplier.email && "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderStars(supplier.rating)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.is_active ? "default" : "secondary"}>
                      {supplier.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AddSupplierDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </Card>
  );
};