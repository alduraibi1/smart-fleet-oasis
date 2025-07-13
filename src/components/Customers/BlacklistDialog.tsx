import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types";
import { AlertTriangle, Shield, Ban } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface BlacklistDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlacklist: (customerId: string, reason: string) => void;
  onRemoveFromBlacklist: (customerId: string) => void;
}

export const BlacklistDialog = ({ 
  customer, 
  open, 
  onOpenChange, 
  onBlacklist, 
  onRemoveFromBlacklist 
}: BlacklistDialogProps) => {
  const [reason, setReason] = useState("");

  if (!customer) return null;

  const handleBlacklist = () => {
    if (!reason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سبب الإضافة للقائمة السوداء",
        variant: "destructive",
      });
      return;
    }

    onBlacklist(customer.id, reason);
    setReason("");
    onOpenChange(false);
    
    toast({
      title: "تم بنجاح",
      description: `تم إضافة ${customer.name} للقائمة السوداء`,
    });
  };

  const handleRemoveFromBlacklist = () => {
    onRemoveFromBlacklist(customer.id);
    onOpenChange(false);
    
    toast({
      title: "تم بنجاح", 
      description: `تم إزالة ${customer.name} من القائمة السوداء`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {customer.blacklisted ? (
              <>
                <Shield className="h-5 w-5 text-green-600" />
                إزالة من القائمة السوداء
              </>
            ) : (
              <>
                <Ban className="h-5 w-5 text-red-600" />
                إضافة للقائمة السوداء
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
              {customer.blacklisted && (
                <Badge variant="destructive" className="mr-auto">
                  مدرج في القائمة السوداء
                </Badge>
              )}
            </div>
          </div>

          {customer.blacklisted ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  هذا العميل مدرج حالياً في القائمة السوداء
                </AlertDescription>
              </Alert>
              
              {customer.blacklistReason && (
                <div>
                  <Label>سبب الإدراج:</Label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm">{customer.blacklistReason}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleRemoveFromBlacklist}
                  variant="outline"
                  className="flex-1"
                >
                  <Shield className="h-4 w-4 ml-2" />
                  إزالة من القائمة السوداء
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  سيتم منع هذا العميل من استئجار المركبات مستقبلاً
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="reason">سبب الإضافة للقائمة السوداء *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: عدم إرجاع المركبة في الوقت المحدد، إلحاق أضرار بالمركبة، عدم دفع المستحقات..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleBlacklist}
                  variant="destructive"
                  className="flex-1"
                >
                  <Ban className="h-4 w-4 ml-2" />
                  إضافة للقائمة السوداء
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};