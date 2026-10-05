import { LogOut } from 'lucide-react';
import { Button, CloseButton, Logo, Modal } from '@/components/ui';
import { useLogoutConfirm } from './LogoutProvider';
import { NavEntry } from './NavEntry';
import { useWorkspaceNav } from './useWorkspaceNav';
import { ThemeToggle } from './ThemeToggle';

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { requestLogout } = useLogoutConfirm();
  const { more } = useWorkspaceNav();

  return (
    <Modal open={open} onClose={onClose} title="More" hideHeader placement="sheet">
      <div className="flex items-center justify-between px-4.5 pt-4">
        <Logo compact className="h-7" />
        <CloseButton onClick={onClose} />
      </div>
      <div className="px-4.5 pt-3 pb-5.5">
        <div className="grid grid-cols-3 gap-2">
          {more.map((item) => {
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
        <Button
          variant="secondary"
          block
          className="mt-3"
          onClick={() => {
            onClose();
            requestLogout();
          }}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </Modal>
  );
}
