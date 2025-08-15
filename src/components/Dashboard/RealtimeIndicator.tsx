
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface RealtimeIndicatorProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  onReconnect?: () => void;
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({
  isConnected,
  lastUpdated,
  onReconnect
}) => {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdated) return;
      
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo("الآن");
      } else if (diff < 3600) {
        setTimeAgo(`منذ ${Math.floor(diff / 60)} دقيقة`);
      } else {
        setTimeAgo(`منذ ${Math.floor(diff / 3600)} ساعة`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isConnected ? "متصل" : "غير متصل"}
      </Badge>
      
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          آخر تحديث: {timeAgo}
        </span>
      )}
      
      {!isConnected && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          إعادة الاتصال
        </button>
      )}
    </div>
  );
};
