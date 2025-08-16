
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types";
import { AlertTriangle, Shield, Ban } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!customer) return null;

  const handleBlacklist = async () => {
    if (!reason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سبب الإضافة للقائمة السوداء",
        variant: "destructive",
      });
      return;
    }

    console.log('🚫 Adding customer to blacklist:', customer.id, 'Reason:', reason);
    setIsProcessing(true);

    try {
      await onBlacklist(customer.id, reason);
      setReason("");
      onOpenChange(false);
      
      toast({
        title: "تم بنجاح",
        description: `تم إضافة ${customer.name} للقائمة السوداء`,
      });
    } catch (error) {
      console.error('💥 Error adding to blacklist:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل للقائمة السوداء",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromBlacklist = async () => {
    console.log('✅ Removing customer from blacklist:', customer.id);
    setIsProcessing(true);

    try {
      await onRemoveFromBlacklist(customer.id);
      onOpenChange(false);
      
      toast({
        title: "تم بنجاح", 
        description: `تم إزالة ${customer.name} من القائمة السوداء`,
      });
    } catch (error) {
      console.error('💥 Error removing from blacklist:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إزالة العميل من القائمة السوداء",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
              
              {customer.blacklist_reason && (
                <div>
                  <Label>سبب الإدراج:</Label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm">{customer.blacklist_reason}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleRemoveFromBlacklist}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <Shield className="h-4 w-4 ml-2" />
                  {isProcessing ? "جاري الإزالة..." : "إزالة من القائمة السوداء"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isProcessing}
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
                  disabled={isProcessing}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleBlacklist}
                  variant="destructive"
                  className="flex-1"
                  disabled={isProcessing || !reason.trim()}
                >
                  <Ban className="h-4 w-4 ml-2" />
                  {isProcessing ? "جاري الإضافة..." : "إضافة للقائمة السوداء"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isProcessing}
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
