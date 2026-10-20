import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useMe, useTransactions, useVerificationStatus } from '@/api/hooks';
import { isStaffRole, type Session, type User } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { storage } from '@/lib/storage';
import { buildInbox, type InboxItem } from './buildInbox';

const READ_EVENT = 'rb.inbox.read';

function inboxOwnerId(session: Session | null, me?: User) {
  return me?.id || session?.user.id || session?.user.email || '';
}

function storageKey(ownerId: string) {
  return `rb.inbox.read.${ownerId}`;
}

function loadRead(ownerId: string): Set<string> {
  if (!ownerId) return new Set();
  const raw = storage.get(storageKey(ownerId));
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveRead(ownerId: string, ids: Set<string>) {
  storage.set(storageKey(ownerId), JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent(READ_EVENT, { detail: { userId: ownerId, ids: [...ids] } }));
}

function mergeSets(...groups: Set<string>[]) {
  const next = new Set<string>();
  for (const group of groups) {
    for (const id of group) next.add(id);
  }
  return next;
}

/** Standing copy that comes and goes with API health. Do not relight the bell for it. */
function countsTowardBadge(item: InboxItem) {
  return item.kind !== 'limits' && item.id !== 'account-provision';
}

export function useInbox() {
  const { session } = useAuth();
  const { data: me } = useMe();
  const { data: account } = useAccount();
  const { data: transactions } = useTransactions({});
  const { data: verification } = useVerificationStatus();
  const userId = inboxOwnerId(session, me);
  const email = session?.user.email ?? '';

  const staff = isStaffRole(session?.user.role ?? me?.role);
  const items = useMemo(
    () => (staff ? [] : buildInbox({ account, transactions, verification })),
    [staff, account, transactions, verification],
  );

  const [readIds, setReadIds] = useState<Set<string>>(() =>
    mergeSets(loadRead(inboxOwnerId(session, me)), loadRead(session?.user.email ?? '')),
  );

  const persist = useCallback(
    (next: Set<string>) => {
      setReadIds(next);
      if (userId) saveRead(userId, next);
      if (email && email !== userId) saveRead(email, next);
    },
    [email, userId],
  );

  useEffect(() => {
    if (!userId && !email) return;
    const merged = mergeSets(loadRead(userId), loadRead(email));
    setReadIds((current) => (merged.size === current.size && [...merged].every((id) => current.has(id)) ? current : merged));
    if (userId && email && userId !== email && loadRead(email).size) {
      saveRead(userId, merged);
    }
  }, [email, userId]);

  useEffect(() => {
    const onLocal = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; ids: string[] }>).detail;
      if (!detail) return;
      if (detail.userId !== userId && detail.userId !== email) return;
      setReadIds((current) => mergeSets(current, new Set(detail.ids)));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey(userId) && event.key !== storageKey(email)) return;
      setReadIds((current) => mergeSets(current, loadRead(userId), loadRead(email)));
    };
    window.addEventListener(READ_EVENT, onLocal);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(READ_EVENT, onLocal);
      window.removeEventListener('storage', onStorage);
    };
  }, [email, userId]);

  const unread = useMemo(
    () => items.filter((item) => countsTowardBadge(item) && !readIds.has(item.id)),
    [items, readIds],
  );

  const markRead = useCallback(
    (item: InboxItem) => {
      if (readIds.has(item.id)) return;
      persist(mergeSets(readIds, new Set([item.id])));
    },
    [persist, readIds],
  );

  const markAllRead = useCallback(() => {
    const next = mergeSets(readIds, new Set(items.map((item) => item.id)));
    if (next.size === readIds.size) return;
    persist(next);
  }, [items, persist, readIds]);

  const isUnread = useCallback(
    (id: string) => {
      const item = items.find((row) => row.id === id);
      if (item && !countsTowardBadge(item)) return false;
      return !readIds.has(id);
    },
    [items, readIds],
  );

  return { items, unread, unreadCount: unread.length, isUnread, markRead, markAllRead };
}
