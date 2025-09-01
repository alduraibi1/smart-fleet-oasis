
import { Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';
import { useState } from 'react';

export default function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const toggleMobileSearch = () => {
    const newState = !showMobileSearch;
    console.log('Toggling mobile search from', showMobileSearch, 'to', newState);
    setShowMobileSearch(newState);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 backdrop-glass">
      <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between spacing-adaptive">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {/* Desktop Search */}
          <div className="hidden sm:flex items-center gap-2 max-w-xs lg:max-w-sm flex-1">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="البحث..."
              className="input-responsive border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="sm:hidden btn-icon-responsive"
            onClick={toggleMobileSearch}
            type="button"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <NotificationCenter />
          
          <Button variant="ghost" size="sm" className="btn-icon-responsive">
            <Settings className="h-4 w-4" />
          </Button>

          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary/10 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="sm:hidden px-2 pb-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="البحث..."
              className="input-responsive border-border/50 focus:border-primary/50 flex-1"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMobileSearch(false)}
              className="text-muted-foreground"
              type="button"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export { Header };
