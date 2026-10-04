import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { useTransfer } from '@/features/transfer/TransferProvider';
import { paths, type NavItem } from './navigation';

/**
 * Renders a nav item as a route link or an action button, so the sidebar,
 * tabs and More sheet don't each need to know which items open modals.
 */
export function NavEntry({
  item,
  className,
  onNavigate,
  children,
}: {
  item: NavItem;
  /** Receives isActive for route links; always false for actions */
  className: (isActive: boolean) => string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const { openTransfer } = useTransfer();

  if (item.action === 'transfer') {
    return (
      <button
        type="button"
        className={className(false)}
        onClick={() => {
          onNavigate?.();
          openTransfer();
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <NavLink
      to={item.to ?? paths.home}
      end={item.to === paths.home || item.to === paths.admin}
      onClick={onNavigate}
      className={({ isActive }) => className(isActive)}
    >
      {children}
    </NavLink>
  );
}
