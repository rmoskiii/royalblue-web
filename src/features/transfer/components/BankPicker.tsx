import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Bank } from '@/api/types';
import { cn } from '@/lib/cn';

/** Bank dropdown with instant search filtering (PRD View 3). */
export function BankPicker({
  banks,
  value,
  onChange,
}: {
  banks: Bank[];
  value: string;
  onChange: (bankCode: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const listId = useId();

  const selected = banks.find((b) => b.code === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? banks.filter((b) => b.name.toLowerCase().includes(q)) : banks;
  }, [banks, query]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const choose = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative grid gap-1.5">
      <span id={labelId} className="text-[13px] font-medium text-ink-2">
        Bank
      </span>
      <button
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center justify-between rounded-field bg-surface-2 px-3.5 text-left text-base outline-none focus-visible:ring-3 focus-visible:ring-brand/15"
      >
        <span className={cn(!selected && 'text-ink-3')}>{selected?.name ?? 'Choose a bank'}</span>
        <ChevronDown className="size-4 text-ink-3" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-10 mt-1.5 overflow-hidden rounded-tile border border-line bg-surface shadow-card">
          <label className="flex items-center gap-2 border-b border-line px-3 text-ink-3">
            <Search className="size-4" />
            <span className="sr-only">Search banks</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
                if (e.key === 'Enter' && filtered[0]) {
                  e.preventDefault();
                  choose(filtered[0].code);
                }
              }}
              placeholder="Search banks"
              className="h-11 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
            />
          </label>
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            className="max-h-56 overflow-auto py-1"
          >
            {filtered.map((b) => (
              <li key={`${b.code}-${b.name}`} role="option" aria-selected={b.code === value}>
                <button
                  type="button"
                  onClick={() => choose(b.code)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left hover:bg-surface-2"
                >
                  {b.name}
                  {b.code === value && <Check className="size-4 text-primary-text" />}
                </button>
              </li>
            ))}
            {!filtered.length && (
              <li className="px-3.5 py-3 text-ink-3">No banks match “{query}”.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
