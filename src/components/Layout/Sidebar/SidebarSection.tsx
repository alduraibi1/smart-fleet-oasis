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
          "w-full justify-between h-11 px-4 rounded-xl",
          "text-sm font-semibold transition-all duration-300",
          "hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md",
          "border border-transparent hover:border-border/50",
          isExpanded 
            ? "bg-accent/50 text-accent-foreground shadow-sm" 
            : "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-1.5 rounded-lg transition-colors duration-300",
            isExpanded ? "bg-primary/20 text-primary" : "bg-muted/50"
          )}>
            <section.icon className="h-4 w-4" />
          </div>
          <span>{section.title}</span>
        </div>
        <div className={cn(
          "transition-transform duration-300",
          isExpanded ? "rotate-180" : "rotate-0"
        )}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </Button>

      {/* Section Items */}
      <div className={cn(
        "space-y-1 transition-all duration-300 overflow-hidden",
        isExpanded 
          ? "max-h-96 opacity-100 pr-2" 
          : "max-h-0 opacity-0"
      )}>
        {section.items.map((item, itemIndex) => (
          <SidebarItem
            key={item.href}
            item={item}
            itemIndex={itemIndex}
            onClose={onClose}
          />
        ))}
      </div>

      {/* Separator after each section except the last */}
      {!isLastSection && (
        <div className="relative">
          <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-muted rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}