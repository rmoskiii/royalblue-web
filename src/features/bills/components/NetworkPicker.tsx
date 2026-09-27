import type { Network } from '@/api/types';
import { networks } from '@/api/reference';

export function NetworkPicker({
  value,
  onChange,
}: {
  value: Network;
  onChange: (n: Network) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[13px] font-medium text-ink-2">Network</span>
      <div role="radiogroup" aria-label="Network" className="grid grid-cols-4 gap-2">
        {networks.map((n) => (
          <button
            key={n.id}
            type="button"
            role="radio"
            aria-checked={value === n.id}
            onClick={() => onChange(n.id)}
            className="h-11 rounded-field border border-line bg-surface text-sm font-semibold aria-checked:border-primary aria-checked:bg-primary-soft aria-checked:text-primary-text"
          >
            {n.name}
          </button>
        ))}
      </div>
    </div>
  );
}
