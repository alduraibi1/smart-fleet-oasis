import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MenuSection } from './menuConfig';
import { SidebarItem } from './SidebarItem';

interface SidebarSectionProps {
  section: MenuSection;
  sectionIndex: number;
  isExpanded: boolean;
  isLastSection: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function SidebarSection({ 
  section, 
  sectionIndex, 
  isExpanded, 
  isLastSection, 
  onToggle, 
  onClose 
}: SidebarSectionProps) {
  return (
    <div className="space-y-2">
      {/* Section Header */}
      <Button
        variant="ghost"
        onClick={onToggle}
        className={cn(
          "w-full justify-between h-12 px-4 rounded-xl group btn-scale",
          "text-sm font-semibold backdrop-blur-sm",
          "hover-glow transition-all duration-500",
          "border border-transparent hover:border-primary/30",
          isExpanded 
            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-medium border-primary/20" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl transition-all duration-500 shadow-soft",
            isExpanded 
              ? "bg-gradient-to-br from-primary to-primary-variant text-primary-foreground shadow-glow" 
              : "bg-muted/60 group-hover:bg-primary/20 group-hover:text-primary"
          )}>
            <section.icon className="h-4 w-4" />
          </div>
          <span className="font-semibold">{section.title}</span>
        </div>
        <div className={cn(
          "transition-all duration-500 p-1 rounded-lg",
          isExpanded 
            ? "rotate-180 bg-primary/10 text-primary" 
            : "rotate-0 group-hover:bg-accent/50"
        )}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </Button>

      {/* Section Items */}
      <div className={cn(
        "space-y-2 transition-all duration-500 overflow-hidden",
        isExpanded 
          ? "max-h-96 opacity-100 pr-3 mb-2" 
          : "max-h-0 opacity-0"
      )}>
        {section.items.map((item, itemIndex) => (
          <div
            key={item.href}
            className="fade-in"
            style={{
              animationDelay: `${itemIndex * 100}ms`
            }}
          >
            <SidebarItem
              item={item}
              itemIndex={itemIndex}
              onClose={onClose}
            />
          </div>
        ))}
      </div>

      {/* Separator after each section except the last */}
      {!isLastSection && (
        <div className="relative my-6">
          <Separator className="bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-br from-primary/40 to-primary/20 rounded-full shadow-soft" />
          </div>
        </div>
      )}
    </div>
  );
}