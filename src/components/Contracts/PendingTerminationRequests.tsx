
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RequestRow {
  id: string;
  requested_termination_date: string;
  termination_reason?: string | null;
  calculated_charges: number;
  early_termination_fee: number;
  total_amount_due: number;
  payment_option: "immediate" | "manager_approval";
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
  contract?: {
    id: string;
    contract_number: string;
    vehicle_id: string;
    customer_id: string;
    status: string;
  } | null;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
  } | null;
}

export const PendingTerminationRequests = () => {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("early_termination_requests")
        .select(`
          *,
          contract:rental_contracts(
            id, contract_number, vehicle_id, customer_id, status
          ),
          customer:customers(
            id, name, phone
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRows((data as any) || []);
    } catch (e) {
      console.error("Error loading termination requests:", e);
      toast({
        title: "خطأ",
        description: "فشل في جلب طلبات الإلغاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const approve = async (req: RequestRow) => {
    try {
      const user = await supabase.auth.getUser();
      const approverId = user?.data?.user?.id || null;

      const { error: updErr } = await supabase
        .from("early_termination_requests")
        .update({ status: "approved", approved_by: approverId, approved_at: new Date().toISOString() })
        .eq("id", req.id);

      if (updErr) throw updErr;

      // Cancel contract and free the vehicle
      if (req.contract?.id) {
        await supabase
          .from("rental_contracts")
          .update({
            status: "cancelled",
            notes: `إلغاء مبكر معتمد. مبلغ مستحق ${req.total_amount_due} ريال.\n${req.termination_reason || ""}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", req.contract.id);

        if (req.contract.vehicle_id) {
          await supabase
            .from("vehicles")
            .update({ status: "available" })
            .eq("id", req.contract.vehicle_id);
        }
      }

      toast({ title: "تمت الموافقة", description: "تمت الموافقة على طلب الإلغاء المبكر." });
      fetchRows();
    } catch (e) {
      console.error("Approve error:", e);
      toast({ title: "خطأ", description: "تعذر الموافقة على الطلب", variant: "destructive" });
    }
  };

  const reject = async (req: RequestRow) => {
    try {
      const { error } = await supabase
        .from("early_termination_requests")
        .update({ status: "rejected" })
        .eq("id", req.id);

      if (error) throw error;

      toast({ title: "تم الرفض", description: "تم رفض طلب الإلغاء المبكر." });
      fetchRows();
    } catch (e) {
      console.error("Reject error:", e);
      toast({ title: "خطأ", description: "تعذر رفض الطلب", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>طلبات الإلغاء المبكر المعلقة</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">لا توجد طلبات حالياً</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم العقد</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>تاريخ الإلغاء</TableHead>
                <TableHead>الإجمالي المستحق</TableHead>
                <TableHead>الخيار</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.contract?.contract_number || "-"}</TableCell>
                  <TableCell>{r.customer?.name || "-"}</TableCell>
                  <TableCell>{r.requested_termination_date}</TableCell>
                  <TableCell>{r.total_amount_due.toLocaleString()} ريال</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {r.payment_option === "immediate" ? "فوري" : "موافقة مدير"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">معلق</Badge>
                  </TableCell>
                  <TableCell className="space-x-2 space-x-reverse">
                    <Button size="sm" onClick={() => approve(r)}>موافقة</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(r)}>رفض</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
