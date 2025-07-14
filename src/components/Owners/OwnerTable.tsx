import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Car, 
  Phone, 
  Mail, 
  MapPin,
  CreditCard
} from "lucide-react";
import { Owner } from "@/hooks/useOwners";
import { EditOwnerDialog } from "./EditOwnerDialog";
import { DeleteOwnerDialog } from "./DeleteOwnerDialog";
import { OwnerDetailsDialog } from "./OwnerDetailsDialog";

interface OwnerTableProps {
  owners: Owner[];
  loading: boolean;
  onUpdate: (id: string, owner: Partial<Owner>) => void;
  onDelete: (id: string) => void;
}

export const OwnerTable = ({ owners, loading, onUpdate, onDelete }: OwnerTableProps) => {
  const [editDialog, setEditDialog] = useState<{ open: boolean; owner: Owner | null }>({
    open: false,
    owner: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; owner: Owner | null }>({
    open: false,
    owner: null,
  });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; owner: Owner | null }>({
    open: false,
    owner: null,
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (owners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد ملاك</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المالك</TableHead>
              <TableHead>معلومات الاتصال</TableHead>
              <TableHead>رقم الهوية</TableHead>
              <TableHead>المركبات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead className="w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.map((owner) => (
              <TableRow key={owner.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-semibold">{owner.name}</div>
                      {owner.address && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {owner.address.substring(0, 50)}
                          {owner.address.length > 50 ? "..." : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {owner.phone && (
                      <div className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {owner.phone}
                      </div>
                    )}
                    {owner.email && (
                      <div className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {owner.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {owner.national_id && (
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {owner.national_id}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <Car className="h-3 w-3" />
                    {owner.vehicle_count || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={owner.is_active ? "default" : "secondary"}>
                    {owner.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(owner.created_at).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setDetailsDialog({ open: true, owner })}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditDialog({ open: true, owner })}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteDialog({ open: true, owner })}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditOwnerDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, owner: null })}
        owner={editDialog.owner}
        onUpdate={onUpdate}
      />

      <DeleteOwnerDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, owner: null })}
        owner={deleteDialog.owner}
        onDelete={onDelete}
      />

      <OwnerDetailsDialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ open, owner: null })}
        owner={detailsDialog.owner}
      />
    </>
  );
};