import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useMe, useTransactions, useVerificationStatus } from '@/api/hooks';
import { buildInbox, type InboxItem } from './buildInbox';

function storageKey(userId: string) {
  return `rb.inbox.read.${userId}`;
}

function loadRead(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function useInbox() {
  const { data: me } = useMe();
  const { data: account } = useAccount();
  const { data: transactions } = useTransactions({});
  const { data: verification } = useVerificationStatus();
  const userId = me?.id ?? 'anon';

  const items = useMemo(
    () => buildInbox({ account, transactions, verification }),
    [account, transactions, verification],
  );

  const [readIds, setReadIds] = useState<Set<string>>(() => loadRead(userId));

  useEffect(() => {
    setReadIds(loadRead(userId));
  }, [userId]);

  const persist = useCallback(
    (next: Set<string>) => {
      setReadIds(next);
      localStorage.setItem(storageKey(userId), JSON.stringify([...next]));
    },
    [userId],
  );

  const unread = useMemo(
    () => items.filter((item) => !readIds.has(item.id)),
    [items, readIds],
  );

  const markRead = useCallback(
    (item: InboxItem) => {
      if (readIds.has(item.id)) return;
      persist(new Set(readIds).add(item.id));
    },
    [persist, readIds],
  );

  const markAllRead = useCallback(() => {
    persist(new Set(items.map((item) => item.id)));
  }, [items, persist]);

  const isUnread = useCallback((id: string) => !readIds.has(id), [readIds]);

  return { items, unread, unreadCount: unread.length, isUnread, markRead, markAllRead };
}
