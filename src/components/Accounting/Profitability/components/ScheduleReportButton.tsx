
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useReportSettings } from "../hooks/useReportSettings";
import { CalendarClock } from "lucide-react";

interface Props {
  reportType: "vehicle" | "owner" | "customer";
  defaultName: string;
  settings: Record<string, any>;
}

export function ScheduleReportButton({ reportType, defaultName, settings }: Props) {
  const { toast } = useToast();
  const { scheduleReport } = useReportSettings();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recipients, setRecipients] = useState("");

  const [loading, setLoading] = useState(false);

  const onSchedule = async () => {
    setLoading(true);
    try {
      const recipientList = recipients
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
      await scheduleReport(reportType, name || defaultName, settings, scheduleType, recipientList);
      toast({ title: "تمت الجدولة", description: "سيتم إرسال التقرير حسب الجدول المحدد" });
      setOpen(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: "فشل الجدولة", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock className="h-4 w-4 ml-2" />
          جدولة تقرير
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>جدولة إرسال التقرير</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>اسم التقرير</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultName} />
          </div>
          <div>
            <Label>نوع الجدولة</Label>
            <Select value={scheduleType} onValueChange={(v: "daily" | "weekly" | "monthly") => setScheduleType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="weekly">أسبوعي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>المستلمون (افصل بينهم بفاصلة ,)</Label>
            <Input
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="example@domain.com, manager@domain.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSchedule} disabled={loading}>
            {loading ? "جارٍ الجدولة..." : "تأكيد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
