
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  RefreshCcw, 
  Activity, 
  Wifi, 
  BarChart3
} from 'lucide-react';
import { useTrackerSync } from '@/hooks/useTrackerSync';
import { useToast } from '@/hooks/use-toast';
import TrackerSyncDashboard from './TrackerSyncDashboard';
import SyncResultDialog from './SyncResultDialog';
import type { TrackerSyncSummary } from '@/hooks/useTrackerSync';

const TrackerSyncButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [lastResult, setLastResult] = useState<TrackerSyncSummary | null>(null);
  const { syncAuto } = useTrackerSync();
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncAuto(false);
      setLastResult(result);

      if (result.success) {
        const matched = result.summary?.matched ?? 0;
        const updated = result.summary?.updatedVehicles ?? 0;
        const discovered = result.summary?.discoveredDevices?.length ?? 0;
        const hasIssues = (result.summary?.errors?.length ?? 0) > 0 || (result.summary?.unmatchedSuggestions?.length ?? 0) > 0;

        toast({
          title: "تمت المزامنة",
          description: `مطابقة: ${matched} • تحديث مركبات: ${updated} • أجهزة مكتشفة: ${discovered}${hasIssues ? " • توجد تفاصيل/أخطاء" : ""}`,
          variant: hasIssues ? "default" : "default"
        });

        if (hasIssues) {
          setIsResultOpen(true);
        }
      } else {
        toast({
          title: "فشلت المزامنة",
          description: lastResult?.error || result.error || (result.summary?.errors?.[0] ?? "حدث خطأ أثناء المزامنة"),
          variant: "destructive"
        });
        setIsResultOpen(true);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر الاتصال بخدمة التتبع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          مزامنة أجهزة التتبع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handleSync}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'جاري المزامنة...' : 'مزامنة سريعة'}
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            disabled={!lastResult}
            onClick={() => setIsResultOpen(true)}
          >
            عرض تفاصيل المزامنة
          </Button>

          <Dialog open={isDashboardOpen} onOpenChange={setIsDashboardOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                لوحة التحكم المتقدمة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>لوحة تحكم أجهزة التتبع المتقدمة</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                <TrackerSyncDashboard />
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Wifi className="h-3 w-3" />
              15 جهاز
            </Badge>
            <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
              <Activity className="h-3 w-3" />
              12 متصل
            </Badge>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-muted-foreground">
          آخر مزامنة: منذ 5 دقائق • معدل النجاح: 95%
        </div>
      </CardContent>

      <SyncResultDialog
        open={isResultOpen}
        onOpenChange={setIsResultOpen}
        result={lastResult}
      />
    </Card>
  );
};

export default TrackerSyncButton;
