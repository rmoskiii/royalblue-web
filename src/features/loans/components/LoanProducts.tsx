import { Banknote, FileText, Store, Truck, type LucideIcon } from 'lucide-react';
import type { LoanProduct } from '@/api/types';
import { formatNaira } from '@/lib/format';

function productIcon(id: string, name: string): LucideIcon {
  const key = `${id} ${name}`.toLowerCase();
  if (key.includes('lease') || key.includes('asset')) return Truck;
  if (key.includes('lpo')) return FileText;
  if (key.includes('instant') || key.includes('salary') || key.includes('sal-')) return Banknote;
  return Store;
}

function tenorLabel(options: number[]) {
  const min = Math.min(...options);
  const max = Math.max(...options);
  return min === max ? `${max} months` : `${min} to ${max} months`;
}

export function LoanProducts({
  products,
  onEstimate,
}: {
  products: LoanProduct[];
  onEstimate: (product: LoanProduct) => void;
}) {
  return (
    <section>
      <h2 className="mt-2 mb-2.5 text-base font-semibold">Financing options</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3">
        {products.map((p) => {
          const Icon = productIcon(p.id, p.name);
          return (
            <article
              key={p.id}
              className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-brand">
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-1 text-[15px] font-semibold">{p.name}</h3>
              <p className="flex-1 text-[13px] text-ink-2">{p.description}</p>
              <p className="text-xs text-ink-3 tabular">
                Up to {formatNaira(p.maxAmount)} · {tenorLabel(p.tenorOptions)}
              </p>
              <button
                type="button"
                onClick={() => onEstimate(p)}
                className="self-start text-[13px] font-medium text-primary-text hover:underline"
              >
                Estimate repayment
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
