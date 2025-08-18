
import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Header from './Header';
import { BreadcrumbNavigation } from '@/components/UI/Navigation/BreadcrumbNavigation';
import { ErrorBoundary } from '@/components/UI/ErrorStates/ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <Header onMenuClick={() => {}} />
            <BreadcrumbNavigation />
            <main className="flex-1 p-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
