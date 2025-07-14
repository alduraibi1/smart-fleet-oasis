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
        "transition-all duration-500 transform btn-scale backdrop-blur-sm",
        "hover-glow group relative overflow-hidden",
        "border border-transparent hover:border-primary/30",
        isActive 
          ? "bg-gradient-to-r from-primary via-primary to-primary-variant text-primary-foreground shadow-strong border-primary/30 scale-[1.02]" 
          : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30"
      )}
      style={{
        animationDelay: `${itemIndex * 75}ms`
      }}
    >
      {/* Background shimmer effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/25 to-primary/15",
        "transform transition-all duration-500 scale-x-0 group-hover:scale-x-100",
        "origin-left opacity-0 group-hover:opacity-100"
      )} />
      
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100",
        "bg-gradient-to-r from-transparent via-primary/10 to-transparent",
        "transition-opacity duration-500"
      )} />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className={cn(
          "p-2 rounded-xl transition-all duration-500 shadow-soft",
          isActive 
            ? "bg-gradient-to-br from-white/25 to-white/15 text-white shadow-medium" 
            : "bg-muted/40 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 group-hover:text-primary group-hover:shadow-medium"
        )}>
          <item.icon className="h-4 w-4" />
        </div>
        <span className={cn(
          "font-semibold text-sm transition-all duration-300",
          isActive ? "text-white" : "group-hover:text-foreground"
        )}>
          {item.title}
        </span>
      </div>
      
      {item.badge && (
        <Badge 
          variant={isActive ? "secondary" : item.badge.variant}
          className={cn(
            "h-6 px-3 text-xs font-bold transition-all duration-500 relative z-10 shadow-medium",
            isActive 
              ? "bg-white/25 text-white border-white/30 loading-pulse" 
              : "shadow-soft hover:shadow-medium group-hover:scale-110"
          )}
        >
          {item.badge.count}
        </Badge>
      )}
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-gradient-to-t from-white/60 to-white/80 rounded-r-full shadow-glow" />
      )}
      
      {/* Subtle shine effect */}
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30 rounded-xl" />
      )}
    </Link>
  );
}