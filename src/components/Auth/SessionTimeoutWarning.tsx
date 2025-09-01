import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SessionTimeoutWarningProps {
  warningMinutes?: number; // Default 5 minutes before expiry
}

export function SessionTimeoutWarning({ warningMinutes = 5 }: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [extending, setExtending] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.expires_at) return;

    const checkSessionExpiry = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      const warningThreshold = warningMinutes * 60;

      if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeRemaining(timeUntilExpiry);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSessionExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000);

    return () => clearInterval(interval);
  }, [session?.expires_at, warningMinutes]);

  const handleExtendSession = async () => {
    setExtending(true);
    try {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setExtending(false);
    }
  };

  if (!showWarning) return null;

  const minutes = Math.ceil(timeRemaining / 60);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>انتهاء الجلسة قريباً</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>ستنتهي جلستك خلال {minutes} دقيقة. سيتم تسجيل خروجك تلقائياً.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExtendSession}
          disabled={extending}
          className="flex items-center gap-2"
        >
          {extending ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              جاري التجديد...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              تجديد الجلسة
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}