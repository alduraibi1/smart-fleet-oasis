
import React, { useState } from 'react';
import { BarChart3, Users, Shield, Settings, FileText, Lock, Zap, Database, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import SystemSettings from './SystemSettings';
import ActivityLogs from './ActivityLogs';
import SecurityAudit from './SecurityAudit';
import { SystemOptimizationDashboard } from './SystemOptimizationDashboard';
import { SampleDataManager } from './SampleDataManager';
import { NationalitiesManagement } from './NationalitiesManagement';

export const SystemManagementOverview = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabsData = [
    { id: 'overview', label: 'نظرة عامة', content: 'محتوى النظرة العامة' },
    { id: 'users', label: 'إدارة المستخدمين', content: 'محتوى إدارة المستخدمين' },
    { id: 'roles', label: 'إدارة الأدوار', content: 'محتوى إدارة الأدوار' },
    { id: 'nationalities', label: 'إدارة الجنسيات', content: 'محتوى إدارة الجنسيات' },
    { id: 'settings', label: 'إعدادات النظام', content: 'محتوى إعدادات النظام' },
    { id: 'logs', label: 'سجلات النشاط', content: 'محتوى سجلات النشاط' },
    { id: 'security', label: 'الأمان والمراجعة', content: 'محتوى الأمان والمراجعة' },
    { id: 'optimization', label: 'تحسين الأداء', content: 'محتوى تحسين الأداء' },
    { id: 'sample-data', label: 'البيانات التجريبية', content: 'محتوى البيانات التجريبية' }
  ];
  
  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users },
    { id: 'roles', label: 'إدارة الأدوار', icon: Shield },
    { id: 'nationalities', label: 'إدارة الجنسيات', icon: Globe },
    { id: 'settings', label: 'إعدادات النظام', icon: Settings },
    { id: 'logs', label: 'سجلات النشاط', icon: FileText },
    { id: 'security', label: 'الأمان والمراجعة', icon: Lock },
    { id: 'optimization', label: 'تحسين الأداء', icon: Zap },
    { id: 'sample-data', label: 'البيانات التجريبية', icon: Database }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">إدارة النظام</h2>
          <p className="text-sm text-muted-foreground">
            إدارة المستخدمين والأدوار وإعدادات النظام
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger value={tab.id} key={tab.id} className="flex items-center gap-2">
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold">نظرة عامة</h3>
            <p className="text-sm text-muted-foreground">
              هذه الصفحة تعرض نظرة عامة على حالة النظام.
            </p>
          </div>
        )}
        
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'roles' && <RoleManagement />}
        {activeTab === 'nationalities' && <NationalitiesManagement />}
        {activeTab === 'settings' && <SystemSettings />}
        {activeTab === 'logs' && <ActivityLogs />}
        {activeTab === 'security' && <SecurityAudit />}
        {activeTab === 'optimization' && <SystemOptimizationDashboard />}
        {activeTab === 'sample-data' && <SampleDataManager />}
      </div>
    </div>
  );
};
