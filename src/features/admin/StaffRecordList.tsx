import type { ReactNode } from 'react';
import { Button, Card } from '@/components/ui';

export type StaffListPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function StaffRecordList({
  filters,
  page,
  pageSize,
  total,
  empty,
  onPageChange,
  children,
}: {
  filters?: ReactNode;
  page: number;
  pageSize: number;
  total: number;
  empty: string;
  onPageChange: (page: number) => void;
  children: ReactNode;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize) || 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="grid gap-3">
      {filters}
      {total === 0 ? <Card className="p-4 text-[13px] text-ink-2">{empty}</Card> : children}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-3">
          <p>
            {from}–{to} of {total}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
