
import { Button } from '@/components/ui/button';
import { Menu, User, Search, Settings, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import NotificationCenter from '@/components/Notifications/NotificationCenter';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="backdrop-glass border-b border-border/60 px-6 py-4 sticky top-0 z-50 shadow-soft">
      <div className="flex items-center justify-between">
        {/* Mobile menu button and search */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden btn-scale focus-glow"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:block">
            <div className="relative group">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                placeholder="بحث في النظام..."
                className="pr-10 w-80 focus:w-96 transition-all duration-500 focus-glow bg-card/50 backdrop-blur-sm border-border/60"
              />
            </div>
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="btn-scale">
            <ThemeToggle />
          </div>

          {/* Notifications */}
          <NotificationCenter />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 btn-scale hover-glow p-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">أحمد محمد</p>
                  <p className="text-xs text-muted-foreground">مدير النظام</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-variant text-primary-foreground flex items-center justify-center shadow-medium">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 backdrop-glass border-border/60 shadow-strong">
              <DropdownMenuItem className="gap-3 hover-glow">
                <User className="w-4 h-4 text-primary" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 hover-glow">
                <Settings className="w-4 h-4 text-primary" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem className="gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
