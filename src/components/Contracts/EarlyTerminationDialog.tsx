
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { EarlyTerminationCalculator } from "./EarlyTerminationCalculator";
import { MinimalContractForEarlyTermination, calculateEarlyTerminationCharges } from "@/utils/earlyTerminationUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: MinimalContractForEarlyTermination & {
    contract_number?: string;
    customer?: { id?: string; name?: string };
  };
  onCreated?: () => void;
}

export const EarlyTerminationDialog = ({ open, onOpenChange, contract, onCreated }: Props) => {
  const [requestedDate, setRequestedDate] = useState<Date>(new Date());
  const [reason, setReason] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"immediate" | "manager_approval">("manager_approval");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const requestedDateISO = requestedDate.toISOString().split("T")[0];

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const breakdown = calculateEarlyTerminationCharges(contract, requestedDateISO);

      // Use type assertion for the new table
      const { data, error } = await (supabase as any)
        .from("early_termination_requests")
        .insert([{
          contract_id: contract.id,
          customer_id: contract.customer_id,
          requested_termination_date: requestedDateISO,
          termination_reason: reason,
          calculated_charges: breakdown.baseProrated,
          early_termination_fee: breakdown.fee,
          total_amount_due: breakdown.totalDue,
          payment_option: paymentOption,
          status: "pending",
        }])
        .select("id")
        .single();

      if (error) throw error;

      // Fire notification via Edge Function (best-effort)
      await supabase.functions.invoke("contract-notifications", {
        body: {
          type: "early_termination_request",
          request_id: data?.id,
          contract_number: contract.contract_number,
          customer_name: contract.customer?.name,
          total_amount_due: breakdown.totalDue,
          requested_termination_date: requestedDateISO,
        },
      }).catch((e) => {
        console.log("Edge function notify error (non-blocking):", e);
      });

      toast({
        title: "تم إرسال الطلب",
        description: "تم إنشاء طلب الإلغاء المبكر وإشعار الإدارة.",
      });
      onOpenChange(false);
      setReason("");
      if (onCreated) onCreated();
    } catch (e) {
      console.error("Error creating early termination request:", e);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء طلب الإلغاء المبكر",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>طلب إلغاء مبكر - {contract.contract_number || ""}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تاريخ الإلغاء المطلوب</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(requestedDate, "dd/MM/yyyy", { locale: ar })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={requestedDate}
                    onSelect={(d) => d && setRequestedDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>خيار الدفع</Label>
              <Select value={paymentOption} onValueChange={(v) => setPaymentOption(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الخيار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">دفع فوري</SelectItem>
                  <SelectItem value="manager_approval">يتطلب موافقة المدير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="reason">سبب الإلغاء</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب الإلغاء..."
            />
          </div>

          <EarlyTerminationCalculator contract={contract} requestedDateISO={requestedDateISO} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "جاري الإرسال..." : "إرسال الطلب"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
