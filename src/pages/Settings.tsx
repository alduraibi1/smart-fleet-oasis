
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            إعدادات النظام
          </CardTitle>
          <CardDescription>
            قم بتخصيص إعدادات النظام حسب احتياجاتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            صفحة الإعدادات قيد التطوير...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
