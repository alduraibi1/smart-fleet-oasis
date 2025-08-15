
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';

export function NotificationBell() {
  const { notifications } = useSmartNotifications();
  const unreadCount = notifications?.length || 0;

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
