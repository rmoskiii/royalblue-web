import { useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { paths } from '@/components/layout/navigation';
import { Button, Card, EmptyState, PageHeader, SectionLoader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDayLabel, formatTime } from '@/lib/format';
import { useInbox } from './useInbox';
import { isActionItem, type InboxItem, type InboxKind } from './buildInbox';

const kindDot: Record<InboxKind, string> = {
  money: 'bg-success',
  pending: 'bg-warning',
  failed: 'bg-primary-text',
  limits: 'bg-brand',
  account: 'bg-ink-3',
  loan: 'bg-tint-loans',
  card: 'bg-brand',
};

export function NotificationsPage() {
  const { items, unreadCount, isUnread, markRead, markAllRead, isLoading } = useInbox();

  useEffect(() => {
    if (items.length === 0) return;
    markAllRead();
  }, [items, markAllRead]);

  return (
    <div className="mx-auto min-w-0 max-w-xl">
      <PageHeader
        title="Notifications"
        subtitle="Limits, loans, cards, and money in or out — not a separate inbox."
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />
      {isLoading ? (
        <SectionLoader label="Loading notifications" />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState title="You’re all caught up">
            Sends, receipts and limit reminders will show here.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-4">
          <InboxGroup
            title="Needs attention"
            items={items.filter(isActionItem)}
            isUnread={isUnread}
            markRead={markRead}
          />
          <InboxGroup
            title="Activity"
            items={items.filter((item) => !isActionItem(item))}
            isUnread={isUnread}
            markRead={markRead}
          />
        </div>
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

function InboxGroup({
  title,
  items,
  isUnread,
  markRead,
}: {
  title: string;
  items: InboxItem[];
  isUnread: (id: string) => boolean;
  markRead: (item: InboxItem) => void;
}) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-2 text-[13px] font-semibold text-ink-3">{title}</h2>
      <Card className="min-w-0 overflow-hidden p-0">
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const unread = isUnread(item.id);
            const stamp = item.createdAt.startsWith('9999')
              ? null
              : `${formatDayLabel(item.createdAt)} · ${formatTime(item.createdAt)}`;
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => markRead(item)}
                  className={cn(
                    'grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 px-4 py-3.5 hover:bg-surface-2',
                    unread && 'bg-surface-2/60',
                  )}
                >
                  <span
                    className={cn('mt-1.5 size-2 shrink-0 rounded-full', kindDot[item.kind])}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className={cn('block break-words text-sm', unread ? 'font-semibold' : 'font-medium')}>
                      {item.title}
                    </span>
                    {stamp ? <span className="mt-0.5 block text-[11px] text-ink-3">{stamp}</span> : null}
                    <span className="mt-0.5 block truncate text-[13px] text-ink-2">{item.body}</span>
                  </span>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-ink-3" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
