import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Wrench, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MaintenanceRecord } from "@/types";

interface MaintenanceTableProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  mechanicFilter: string;
  dateFilter: string;
}

export function MaintenanceTable({
  searchTerm,
  statusFilter,
  typeFilter,
  mechanicFilter,
  dateFilter
}: MaintenanceTableProps) {
  // Mock data - in real app, this would come from API
  const mockMaintenanceRecords: (MaintenanceRecord & { 
    vehiclePlateNumber: string;
    mechanicName: string;
  })[] = [
    {
      id: "1",
      vehicleId: "v1",
      vehiclePlateNumber: "أ ب ج 1234",
      mechanicId: "m1",
      mechanicName: "أحمد محمد",
      date: new Date("2024-01-15"),
      type: "scheduled" as const,
      description: "صيانة دورية - تغيير زيت وفلاتر",
      partsUsed: [],
      oilsUsed: [],
      laborCost: 300,
      partsCost: 120,
      oilsCost: 80,
      totalCost: 500,
      laborHours: 6,
      warranty: true,
      warrantyExpiry: new Date("2024-07-15"),
      notes: "تم تغيير زيت المحرك وفلتر الهواء والوقود",
      status: "completed" as const,
      beforeImages: [],
      afterImages: [],
      vehicleConditionBefore: "حالة جيدة عموماً",
      vehicleConditionAfter: "ممتازة بعد الصيانة",
      workStartTime: new Date("2024-01-15T08:00:00"),
      workEndTime: new Date("2024-01-15T14:00:00"),
      qualityRating: 5
    },
    {
      id: "2",
      vehicleId: "v2",
      vehiclePlateNumber: "د هـ و 5678",
      mechanicId: "m2",
      mechanicName: "خالد عبدالله",
      date: new Date("2024-01-20"),
      type: "breakdown" as const,
      description: "إصلاح عطل في نظام التبريد",
      partsUsed: [],
      oilsUsed: [],
      laborCost: 200,
      partsCost: 450,
      oilsCost: 30,
      totalCost: 680,
      laborHours: 4,
      warranty: false,
      notes: "تم استبدال رديتر التبريد وخرطوم المياه",
      status: "in_progress" as const,
      beforeImages: [],
      afterImages: [],
      vehicleConditionBefore: "مشكلة في نظام التبريد",
      vehicleConditionAfter: "قيد الإصلاح",
      workStartTime: new Date("2024-01-20T09:00:00"),
      workEndTime: undefined,
      qualityRating: undefined
    },
    {
      id: "3",
      vehicleId: "v3",
      vehiclePlateNumber: "ز ح ط 9012",
      mechanicId: "m3",
      mechanicName: "محمد علي",
      date: new Date("2024-01-25"),
      type: "inspection" as const,
      description: "فحص دوري قبل التسجيل",
      partsUsed: [],
      oilsUsed: [],
      laborCost: 100,
      partsCost: 0,
      oilsCost: 0,
      totalCost: 150,
      laborHours: 3,
      warranty: false,
      notes: "فحص شامل للمركبة - لا توجد مشاكل",
      status: "pending" as const,
      beforeImages: [],
      afterImages: [],
      vehicleConditionBefore: "يحتاج فحص شامل",
      vehicleConditionAfter: "لم يكتمل الفحص بعد",
      workStartTime: undefined,
      workEndTime: undefined,
      qualityRating: undefined
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "معلقة", variant: "secondary" as const },
      in_progress: { label: "قيد التنفيذ", variant: "default" as const },
      completed: { label: "مكتملة", variant: "default" as const },
      cancelled: { label: "ملغية", variant: "destructive" as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge 
        variant={statusInfo.variant}
        className={
          status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100" :
          status === "in_progress" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
          status === "pending" ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
          ""
        }
      >
        {statusInfo.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      scheduled: { label: "دورية", color: "bg-blue-100 text-blue-800" },
      breakdown: { label: "طارئة", color: "bg-red-100 text-red-800" },
      inspection: { label: "فحص", color: "bg-purple-100 text-purple-800" }
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || typeMap.scheduled;
    return (
      <Badge variant="outline" className={typeInfo.color}>
        {typeInfo.label}
      </Badge>
    );
  };

  // Filter the data based on filters
  const filteredRecords = mockMaintenanceRecords.filter(record => {
    const matchesSearch = searchTerm === "" || 
      record.vehiclePlateNumber.includes(searchTerm) ||
      record.id.includes(searchTerm) ||
      record.description.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    const matchesMechanic = mechanicFilter === "all" || record.mechanicId === mechanicFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesMechanic;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          سجلات الصيانة ({filteredRecords.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم السجل</TableHead>
                <TableHead className="text-right">رقم اللوحة</TableHead>
                <TableHead className="text-right">نوع الصيانة</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الميكانيكي</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">التكلفة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">#{record.id}</TableCell>
                  <TableCell>{record.vehiclePlateNumber}</TableCell>
                  <TableCell>{getTypeBadge(record.type)}</TableCell>
                  <TableCell className="max-w-xs truncate" title={record.description}>
                    {record.description}
                  </TableCell>
                  <TableCell>{record.mechanicName}</TableCell>
                  <TableCell>{record.date.toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{record.totalCost} ر.س</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد سجلات صيانة مطابقة للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}