import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useMe, useTransactions, useVerificationStatus } from '@/api/hooks';
import { useAuth } from '@/app/providers/AuthProvider';
import { storage } from '@/lib/storage';
import { buildInbox, type InboxItem } from './buildInbox';

const READ_EVENT = 'rb.inbox.read';

function storageKey(userId: string) {
  return `rb.inbox.read.${userId}`;
}

function loadRead(userId: string): Set<string> {
  const raw = storage.get(storageKey(userId));
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveRead(userId: string, ids: Set<string>) {
  const list = [...ids];
  storage.set(storageKey(userId), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(READ_EVENT, { detail: { userId, ids: list } }));
}

export function useInbox() {
  const { session } = useAuth();
  const { data: me } = useMe();
  const { data: account } = useAccount();
  const { data: transactions } = useTransactions({});
  const { data: verification } = useVerificationStatus();
  const userId = me?.id ?? session?.user.id ?? '';

  const items = useMemo(
    () => buildInbox({ account, transactions, verification }),
    [account, transactions, verification],
  );

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    setReadIds(loadRead(userId));
  }, [userId]);

  useEffect(() => {
    const onLocal = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; ids: string[] }>).detail;
      if (!detail || detail.userId !== userId) return;
      setReadIds(new Set(detail.ids));
    };
    const onStorage = (event: StorageEvent) => {
      if (!userId || event.key !== storageKey(userId)) return;
      setReadIds(loadRead(userId));
    };
    window.addEventListener(READ_EVENT, onLocal);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(READ_EVENT, onLocal);
      window.removeEventListener('storage', onStorage);
    };
  }, [userId]);

  const persist = useCallback(
    (next: Set<string>) => {
      setReadIds(next);
      if (userId) saveRead(userId, next);
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
