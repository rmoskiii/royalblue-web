import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 px-4 py-10 text-center text-ink-3">
      <Inbox className="size-7" strokeWidth={1.5} />
      <p className="font-medium text-ink-2">{title}</p>
      {children}
    </div>
  );
}
