import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { paths } from '@/components/layout/navigation';
import { Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDayLabel, formatTime } from '@/lib/format';
import { useInbox } from './useInbox';
import type { InboxKind } from './buildInbox';

const kindDot: Record<InboxKind, string> = {
  money: 'bg-success',
  pending: 'bg-warning',
  failed: 'bg-primary-text',
  limits: 'bg-brand',
  account: 'bg-ink-3',
};

export function NotificationsPage() {
  const { items, unreadCount, isUnread, markRead, markAllRead } = useInbox();

  return (
    <div className="mx-auto min-w-0 max-w-xl">
      <PageHeader
        title="Notifications"
        subtitle="From your ledger, limits and account — not a separate inbox."
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <Card>
          <EmptyState title="You’re all caught up">
            Sends, receipts and limit reminders will show here.
          </EmptyState>
        </Card>
      ) : (
        <Card className="min-w-0 overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {items.map((item) => {
              const unread = isUnread(item.id);
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={() => markRead(item)}
                    className={cn(
                      'flex min-w-0 items-start gap-3 px-4 py-3.5 hover:bg-surface-2',
                      unread && 'bg-surface-2/60',
                    )}
                  >
                    <span
                      className={cn('mt-1.5 size-2 shrink-0 rounded-full', kindDot[item.kind])}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={cn('min-w-0 text-sm', unread ? 'font-semibold' : 'font-medium')}>
                          {item.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-3">
                          {formatDayLabel(item.createdAt)} · {formatTime(item.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-ink-2">{item.body}</span>
                    </span>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-ink-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      <p className="mt-3 text-center text-[13px] text-ink-3">
        Choose email alerts in{' '}
        <Link to={paths.settingsNotifications} className="font-medium text-brand hover:underline">
          notification settings
        </Link>
        .
      </p>
    </div>
  );
}
