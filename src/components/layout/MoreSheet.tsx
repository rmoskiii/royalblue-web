import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button, Modal } from '@/components/ui';
import { NavEntry } from './NavEntry';
import { moreNav } from './navigation';
import { ThemeToggle } from './ThemeToggle';

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useAuth();

  return (
    <Modal open={open} onClose={onClose} title="More">
      <div className="px-4.5 pt-2.5 pb-5.5">
        <div className="grid grid-cols-3 gap-2">
          {moreNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavEntry
                key={item.label}
                item={item}
                onNavigate={onClose}
                className={() =>
                  'flex flex-col items-center gap-1.5 rounded-tile border border-line px-1.5 py-3.5 text-center text-xs font-medium hover:bg-surface-2'
                }
              >
                <Icon className="size-5 text-brand" strokeWidth={1.8} />
                {item.label}
              </NavEntry>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-tile bg-surface-2 px-3.5 py-2.5">
          <span className="font-medium">Appearance</span>
          <ThemeToggle className="bg-surface" />
        </div>
        <Button variant="secondary" block className="mt-3" onClick={logout}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </Modal>
  );
}
