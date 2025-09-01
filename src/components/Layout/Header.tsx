
import { Search, Settings, User, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, signOut, userRoles, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleMobileSearch = () => {
    const newState = !showMobileSearch;
    console.log('Toggling mobile search from', showMobileSearch, 'to', newState);
    setShowMobileSearch(newState);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "شكراً لك على استخدام النظام",
      });
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج، حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    return user?.email?.split('@')[0] || 'مستخدم';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (userProfile?.full_name) {
      const names = userProfile.full_name.split(' ');
      if (names.length >= 2) {
        return names[0].charAt(0) + names[1].charAt(0);
      }
      return name.charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getPrimaryRole = () => {
    if (userRoles.includes('admin')) return 'مدير النظام';
    if (userRoles.includes('manager')) return 'مدير';
    if (userRoles.includes('accountant')) return 'محاسب';
    if (userRoles.includes('employee')) return 'موظف';
    return 'مستخدم';
  };

  const getStatusIndicator = () => {
    return {
      color: 'text-green-500',
      text: 'متصل',
      dot: 'bg-green-500'
    };
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary/10 text-xs sm:text-sm">
                    {user ? getUserInitials() : <User className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-sm border-border/50 animate-fade-in" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary/10 text-sm font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusIndicator().dot}`}></div>
                  </div>
                  <div className="flex flex-col space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs leading-none text-muted-foreground">
                        {getPrimaryRole()}
                      </p>
                      <p className={`text-xs leading-none ${getStatusIndicator().color}`}>
                        {getStatusIndicator().text}
                      </p>
                    </div>
                    {userProfile?.phone && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile.phone}
                      </p>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="hover-scale cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="hover-scale cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="hover-scale cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
