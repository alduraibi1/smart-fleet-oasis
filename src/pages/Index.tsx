
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardOverview from '@/components/Dashboard/DashboardOverview';
import AnalyticsDashboard from '@/components/Dashboard/AnalyticsDashboard';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, LogIn } from 'lucide-react';
import { SmartNotifications } from '@/components/Notifications/SmartNotifications';
import { AppLayout } from '@/components/Layout/AppLayout';

const Index = () => {
  const { user } = useAuth();

  // إذا لم يكن المستخدم مسجل الدخول، اعرض صفحة ترحيب
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-variant rounded-3xl shadow-glow mb-6">
              <Car className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
              CarRent Pro
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              نظام إدارة تأجير المركبات المتطور والشامل
            </p>
          </div>

          <Card className="card-premium shadow-strong max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">مرحباً بك</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                قم بتسجيل الدخول للوصول إلى لوحة التحكم وإدارة أسطولك
              </p>
              <Link to="/auth">
                <Button className="w-full btn-glow btn-scale">
                  <LogIn className="h-4 w-4 mr-2" />
                  تسجيل الدخول
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          <div className="fade-in">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-2xl border border-primary/20 backdrop-blur-sm">
              <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                مرحباً بك في نظام إدارة تأجير المركبات
              </h1>
              <p className="text-lg text-muted-foreground">
                نظرة عامة على أداء شركتك وأهم المؤشرات
              </p>
            </div>
          </div>
          
          {/* التنبيهات الذكية */}
          <div className="scale-in">
            <SmartNotifications />
          </div>
          
          <div className="scale-in">
            <DashboardOverview />
          </div>

          <div className="scale-in" style={{ animationDelay: '0.2s' }}>
            <AnalyticsDashboard />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
};

export default Index;
