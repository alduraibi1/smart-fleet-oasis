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
        "fixed top-0 right-0 h-full w-80 backdrop-glass border-l border-border/60 z-50 transform transition-all duration-500 ease-in-out shadow-strong",
        "lg:relative lg:translate-x-0 lg:z-0 lg:w-72",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex flex-col p-6 border-b border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center shadow-medium hover-lift">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                CarRent Pro
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden h-9 w-9 rounded-xl btn-scale hover-glow"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            نظام إدارة تأجير المركبات المتطور
          </p>
        </div>

        {/* Navigation */}
        <nav 
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--primary) / 0.4) transparent',
          }}
        >
          <style>{`
            nav::-webkit-scrollbar {
              width: 8px;
            }
            nav::-webkit-scrollbar-track {
              background: hsl(var(--muted) / 0.2);
              border-radius: 10px;
              margin: 8px 0;
            }
            nav::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, hsl(var(--primary) / 0.7), hsl(var(--primary) / 0.5));
              border-radius: 10px;
              border: 1px solid hsl(var(--background) / 0.5);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 2px 8px hsl(var(--primary) / 0.2);
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7));
              transform: scaleY(1.1);
              box-shadow: 0 4px 12px hsl(var(--primary) / 0.4);
            }
            nav::-webkit-scrollbar-thumb:active {
              background: linear-gradient(135deg, hsl(var(--primary) / 1.1), hsl(var(--primary)));
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
        <div className="p-6 border-t border-border/60 bg-gradient-to-br from-muted/20 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between hover-lift cursor-pointer p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center shadow-medium loading-pulse">
                <Bell className="h-4 w-4 text-warning-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">التنبيهات</span>
                <span className="text-xs text-muted-foreground">5 تنبيهات جديدة</span>
              </div>
            </div>
            <Badge variant="destructive" className="h-6 px-3 text-xs font-medium shadow-medium animate-pulse">
              5
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}