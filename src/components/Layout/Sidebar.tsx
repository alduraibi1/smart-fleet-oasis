
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Car, Calendar, Settings, Users, Database, 
  DollarSign, Home, Menu, X, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'لوحة التحكم',
    icon: Home,
    href: '/',
    section: 'main'
  },
  {
    title: 'إدارة المركبات',
    icon: Car,
    href: '/vehicles',
    section: 'rental'
  },
  {
    title: 'العقود والإيجار',
    icon: Calendar,
    href: '/contracts',
    section: 'rental'
  },
  {
    title: 'العملاء',
    icon: Users,
    href: '/customers',
    section: 'rental'
  },
  {
    title: 'الصيانة',
    icon: Settings,
    href: '/maintenance',
    section: 'maintenance'
  },
  {
    title: 'المخزون وقطع الغيار',
    icon: Database,
    href: '/inventory',
    section: 'maintenance'
  },
  {
    title: 'النظام المحاسبي',
    icon: DollarSign,
    href: '/accounting',
    section: 'finance'
  },
  {
    title: 'الموارد البشرية',
    icon: Users,
    href: '/hr',
    section: 'hr'
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

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
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h1 className="text-xl font-bold text-rental-primary">
            نظام إدارة تأجير المركبات
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Notifications Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />
            <span>5 تنبيهات جديدة</span>
          </div>
        </div>
      </div>
    </>
  );
}
