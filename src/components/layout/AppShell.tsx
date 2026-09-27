import { useState } from 'react';
import { Outlet } from 'react-router';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { TransferProvider } from '@/features/transfer/TransferProvider';
import { BottomTabs } from './BottomTabs';
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
      <TransferProvider>
        <div className="flex h-dvh overflow-hidden">
          <Sidebar className="hidden lg:flex" />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-8 lg:px-7 lg:pt-6 lg:pb-10">
              <div className="mx-auto max-w-[1180px]">
                <Outlet />
              </div>
            </main>
            <BottomTabs className="lg:hidden" onMore={() => setMoreOpen(true)} />
          </div>
        </div>
        <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      </TransferProvider>
    </ProfileProvider>
  );
}
