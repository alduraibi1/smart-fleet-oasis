
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import { SystemStatusBar } from './SystemStatusBar';
import { BreadcrumbNavigation } from '@/components/UI/Navigation/BreadcrumbNavigation';
import { ErrorBoundary } from '@/components/UI/ErrorStates/ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorBoundary>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen-mobile flex w-full bg-background">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <SystemStatusBar />
            <Header onMenuClick={() => {}} />
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 border-b border-border/50">
                <BreadcrumbNavigation />
              </div>
              <main className="flex-1 overflow-auto bg-background">
                <div className="w-full max-w-none mx-auto spacing-adaptive">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
