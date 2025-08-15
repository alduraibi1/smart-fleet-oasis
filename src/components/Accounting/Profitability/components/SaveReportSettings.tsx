
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useReportSettings } from "../hooks/useReportSettings";
import { Save } from "lucide-react";

interface Props {
  reportType: "vehicle" | "owner" | "customer";
  defaultName: string;
  settings: Record<string, any>;
}

export function SaveReportSettings({ reportType, defaultName, settings }: Props) {
  const { toast } = useToast();
  const { saveSettings } = useReportSettings();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    try {
      await saveSettings(reportType, name || defaultName, settings, isDefault);
      toast({ title: "تم الحفظ", description: "تم حفظ إعدادات التقرير بنجاح" });
      setOpen(false);
    } catch (e: any) {
      console.error(e);
      toast({ title: "فشل الحفظ", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 ml-2" />
          حفظ الإعدادات
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حفظ إعدادات التقرير</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>اسم التقرير</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={defaultName} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="default" checked={isDefault} onCheckedChange={(v) => setIsDefault(Boolean(v))} />
            <Label htmlFor="default">تعيين كإعداد افتراضي</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={loading}>
            {loading ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
