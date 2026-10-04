import { Briefcase, Check, ChevronDown, LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useProfile } from '@/app/providers/ProfileProvider';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatAccountNumber } from '@/lib/format';
import { useLogoutConfirm } from './LogoutProvider';

/**
 * Personal ↔ Business profile dropdown (PRD FR-04 / View 2).
 * Desktop: labelled button. Phones: avatar with a small chevron.
 */
export function ProfileSwitcher() {
  const { requestLogout } = useLogoutConfirm();
  const { profiles, profile, switchProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) =>
      !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!profile) return null;
  const hasBusiness = profiles.some((p) => p.type === 'business');

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Switch profile. Current: ${profile.name}`}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full lg:h-10 lg:gap-2 lg:border lg:border-line lg:bg-surface-2 lg:pr-3 lg:pl-1 lg:hover:bg-surface-3"
      >
        <Avatar
          name={profile.name}
          className={cn(
            'lg:size-8 lg:text-xs',
            profile.type === 'business' && 'bg-navy text-white',
          )}
        />
        <span className="hidden max-w-44 truncate text-[13px] font-semibold lg:block">
          {profile.name}
        </span>
        <ChevronDown className="size-4 text-ink-3" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 z-40 mt-2 w-[min(300px,calc(100vw-32px))] animate-sheet-up rounded-tile border border-line bg-surface p-1.5 shadow-card"
        >
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
            Switch profile
          </p>
          {profiles.map((p) => {
            const Icon = p.type === 'business' ? Briefcase : User;
            const active = p.id === profile.id;
            return (
              <button
                key={p.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setOpen(false);
                  switchProfile(p.id);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left hover:bg-surface-2"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand">
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">
                    {p.name}
                  </span>
                  <span className="block text-xs text-ink-3 tabular">
                    {p.type === 'personal' ? 'Personal' : 'Business'} ·{' '}
                    {formatAccountNumber(p.accountNumber)}
                  </span>
                </span>
                {active && <Check className="size-4 text-primary-text" />}
              </button>
            );
          })}
          {!hasBusiness && (
            <p className="px-2.5 py-2 text-xs text-ink-3">
              Register a business to add a business profile.
            </p>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              requestLogout();
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-line px-2.5 py-2.5 text-left hover:bg-surface-2"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand">
              <LogOut className="size-4.5" />
            </span>
            <span className="text-[13px] font-semibold">Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
