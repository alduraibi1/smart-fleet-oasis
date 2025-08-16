
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useMaintenance } from "@/hooks/useMaintenance";
import { 
  Calendar, 
  User, 
  Wrench, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Car,
  Gauge,
  Clock,
  DollarSign
} from "lucide-react";

interface MaintenanceTableProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  mechanicFilter: string;
  dateFilter: string;
}

export const MaintenanceTable = ({ 
  searchTerm, 
  statusFilter, 
  typeFilter, 
  mechanicFilter, 
  dateFilter 
}: MaintenanceTableProps) => {
  const { maintenanceRecords, deleteMaintenanceRecord } = useMaintenance();

  // Filter records based on search criteria
  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesSearch = searchTerm === "" || 
      record.vehicles?.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reported_issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.maintenance_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesType = typeFilter === "all" || record.maintenance_type === typeFilter;
    const matchesMechanic = mechanicFilter === "all" || record.mechanic_id === mechanicFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const recordDate = new Date(record.scheduled_date || record.created_at);
      const today = new Date();
      
      switch (dateFilter) {
        case "today":
          matchesDate = recordDate.toDateString() === today.toDateString();
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = recordDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = recordDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesMechanic && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'جاري';
      case 'scheduled':
        return 'مجدول';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      await deleteMaintenanceRecord(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          سجلات الصيانة ({filteredRecords.length})
        </CardTitle>
        <CardDescription>
          عرض وإدارة جميع سجلات الصيانة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد سجلات صيانة تطابق معايير البحث</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">
                        {record.vehicles?.plate_number} - {record.vehicles?.brand} {record.vehicles?.model}
                      </h3>
                      <Badge variant={getStatusColor(record.status) as any}>
                        {getStatusLabel(record.status)}
                      </Badge>
                      {record.priority && (
                        <Badge variant={getPriorityColor(record.priority) as any} className="text-xs">
                          {record.priority === 'urgent' ? 'عاجل' :
                           record.priority === 'high' ? 'عالي' :
                           record.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      نوع الصيانة: {record.maintenance_type}
                    </p>
                    {record.reported_issue && (
                      <p className="text-sm text-muted-foreground">
                        المشكلة المبلغ عنها: {record.reported_issue}
                      </p>
                    )}
                    {record.description && record.description !== record.reported_issue && (
                      <p className="text-sm text-muted-foreground">
                        الوصف: {record.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {record.scheduled_date ? 
                        new Date(record.scheduled_date).toLocaleDateString('ar-SA') : 
                        new Date(record.created_at).toLocaleDateString('ar-SA')
                      }
                    </span>
                  </div>
                  
                  {record.mechanics?.name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{record.mechanics.name}</span>
                    </div>
                  )}

                  {record.odometer_in && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span>العداد: {record.odometer_in.toLocaleString()}</span>
                      {record.odometer_out && (
                        <span className="text-muted-foreground">
                          → {record.odometer_out.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {(record.total_cost || record.cost) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{(record.total_cost || record.cost || 0).toLocaleString()} ريال</span>
                    </div>
                  )}
                </div>

                {/* Labor and timing info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t pt-3">
                  {record.labor_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>ساعات العمل: {record.labor_hours}</span>
                    </div>
                  )}
                  
                  {record.completed_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>اكتمل في: {new Date(record.completed_date).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}

                  {record.warranty_until && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">ضمان حتى: {new Date(record.warranty_until).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                </div>

                {record.notes && (
                  <div className="text-sm text-muted-foreground border-t pt-3">
                    <strong>ملاحظات:</strong> {record.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
