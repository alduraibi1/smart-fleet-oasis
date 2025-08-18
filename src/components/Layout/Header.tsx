
import { Bell, Search, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="h-9 w-9 md:h-8 md:w-8" />
          
          <div className="hidden sm:flex items-center gap-2 max-w-xs lg:max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث..."
              className="h-9 w-full border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <Button variant="ghost" size="sm" className="sm:hidden h-9 w-9 p-0">
            <Search className="h-4 w-4" />
          </Button>
          
          <NotificationCenter />
          
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:h-8 md:w-8">
            <Settings className="h-4 w-4" />
          </Button>

          <Avatar className="h-8 w-8 md:h-9 md:w-9">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary/10">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="sm:hidden px-3 pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث..."
            className="h-9 flex-1 border-border/50 focus:border-primary/50"
          />
        </div>
      </div>
    </header>
  );
}

export { Header };
