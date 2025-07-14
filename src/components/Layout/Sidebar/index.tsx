import { useState } from 'react';
import { Car, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { menuSections } from './menuConfig';
import { SidebarSection } from './SidebarSection';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'الرئيسية', 'إدارة الأسطول', 'إدارة النظام'
  ]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-72 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 lg:z-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex flex-col p-6 border-b border-border bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">
                CarRent Pro
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden h-8 w-8 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            نظام إدارة تأجير المركبات المتطور
          </p>
        </div>

        {/* Navigation */}
        <nav 
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent',
          }}
        >
          <style>{`
            nav::-webkit-scrollbar {
              width: 12px;
            }
            nav::-webkit-scrollbar-track {
              background: hsl(var(--muted) / 0.3);
              border-radius: 8px;
              margin: 8px 0;
              border: 1px solid hsl(var(--border) / 0.2);
            }
            nav::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.4));
              border-radius: 8px;
              border: 2px solid hsl(var(--background));
              transition: all 0.3s ease;
              box-shadow: 0 2px 4px hsl(var(--primary) / 0.2);
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.6));
              transform: scaleY(1.05);
              box-shadow: 0 4px 8px hsl(var(--primary) / 0.3);
            }
            nav::-webkit-scrollbar-thumb:active {
              background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8));
              transform: scaleY(0.95);
            }
            nav::-webkit-scrollbar-corner {
              background: transparent;
            }
          `}</style>
          
          {menuSections.map((section, sectionIndex) => (
            <SidebarSection
              key={section.title}
              section={section}
              sectionIndex={sectionIndex}
              isExpanded={expandedSections.includes(section.title)}
              isLastSection={sectionIndex === menuSections.length - 1}
              onToggle={() => toggleSection(section.title)}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">التنبيهات</span>
                <span className="text-xs text-muted-foreground">5 تنبيهات جديدة</span>
              </div>
            </div>
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              5
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}