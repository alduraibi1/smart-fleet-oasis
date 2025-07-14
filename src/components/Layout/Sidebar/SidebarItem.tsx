import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MenuItem } from './menuConfig';

interface SidebarItemProps {
  item: MenuItem;
  itemIndex: number;
  onClose: () => void;
}

export function SidebarItem({ item, itemIndex, onClose }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  return (
    <Link
      to={item.href}
      onClick={onClose}
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl",
        "transition-all duration-300 transform hover:scale-[1.02]",
        "hover:bg-accent/60 hover:text-accent-foreground hover:shadow-md",
        "border border-transparent hover:border-border/30",
        "group relative overflow-hidden",
        isActive 
          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg border-primary/20 scale-[1.02]" 
          : "text-muted-foreground"
      )}
      style={{
        animationDelay: `${itemIndex * 50}ms`
      }}
    >
      {/* Background animation */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5",
        "transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100",
        "origin-left"
      )} />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "p-1.5 rounded-lg transition-all duration-300",
          isActive 
            ? "bg-white/20 text-white shadow-sm" 
            : "bg-muted/30 group-hover:bg-primary/20 group-hover:text-primary"
        )}>
          <item.icon className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{item.title}</span>
      </div>
      
      {item.badge && (
        <Badge 
          variant={isActive ? "secondary" : item.badge.variant}
          className={cn(
            "h-6 px-2.5 text-xs font-semibold transition-all duration-300 relative z-10",
            isActive 
              ? "bg-white/20 text-white border-white/30" 
              : "shadow-sm"
          )}
        >
          {item.badge.count}
        </Badge>
      )}
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/40 rounded-r-full" />
      )}
    </Link>
  );
}