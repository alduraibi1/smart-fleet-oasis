
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import { BreadcrumbNavigation } from '@/components/UI/Navigation/BreadcrumbNavigation';
import { ErrorBoundary } from '@/components/UI/ErrorStates/ErrorBoundary';

export default function AppLayout() {
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
                <Outlet />
              </ErrorBoundary>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export { AppLayout };
