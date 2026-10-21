import { useState } from 'react';
import { Outlet } from 'react-router';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { TransferProvider } from '@/features/transfer/TransferProvider';
import { BottomTabs } from './BottomTabs';
import { LogoutProvider } from './LogoutProvider';
import { MoreSheet } from './MoreSheet';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * Signed-in layout.
 * < lg (1024px): top bar + content + bottom tabs
 * ≥ lg: sidebar + top bar + content
 */
export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <ProfileProvider>
      <LogoutProvider>
        <TransferProvider>
          <div className="flex h-dvh min-h-0 overflow-hidden">
            <Sidebar className="hidden lg:flex" />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <TopBar />
              <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip overscroll-contain pt-4 pb-[calc(var(--rb-tabbar)+0.75rem)] pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] lg:px-7 lg:pt-6 lg:pb-10">
                <div className="mx-auto min-w-0 max-w-[1180px]">
                  <Outlet />
                </div>
              </main>
              <BottomTabs className="lg:hidden" onMore={() => setMoreOpen(true)} />
            </div>
          </div>
          <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
        </TransferProvider>
      </LogoutProvider>
    </ProfileProvider>
  );
}
