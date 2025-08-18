
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import { BreadcrumbNavigation } from '@/components/UI/Navigation/BreadcrumbNavigation';
import { ErrorBoundary } from '@/components/UI/ErrorStates/ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorBoundary>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <Header onMenuClick={() => {}} />
            <div className="flex-1 flex flex-col">
              <BreadcrumbNavigation />
              <main className="flex-1 p-3 md:p-6 overflow-auto">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
