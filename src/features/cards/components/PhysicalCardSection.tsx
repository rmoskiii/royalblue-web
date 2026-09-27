import { Check, CreditCard, Truck } from 'lucide-react';
import { useState } from 'react';
import { usePhysicalOrder } from '@/api/hooks';
import type { PhysicalCardOrderStatus } from '@/api/types';
import { Button, Card, CardHeader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { OrderPhysicalCardModal } from './OrderPhysicalCardModal';

const steps: { id: PhysicalCardOrderStatus; label: string }[] = [
  { id: 'ordered', label: 'Ordered' },
  { id: 'printing', label: 'Printing' },
  { id: 'out-for-delivery', label: 'Out for delivery' },
  { id: 'delivered', label: 'Delivered' },
];

/** PRD View 5: physical card ordering with home delivery tracking. */
export function PhysicalCardSection() {
  const { data: order, isLoading } = usePhysicalOrder();
  const [open, setOpen] = useState(false);

  if (isLoading) return null;

  if (!order) {
    return (
      <Card className="flex flex-wrap items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-brand">
          <CreditCard className="size-6" />
        </span>
        <div className="min-w-0 flex-[1_1_220px]">
          <p className="font-semibold">Get a physical debit card</p>
          <p className="text-[13px] text-ink-2">
            Use it at POS terminals and ATMs. We deliver to your door in 3 to 5 working days.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Order card</Button>
        <OrderPhysicalCardModal key={String(open)} open={open} onClose={() => setOpen(false)} />
      </Card>
    );
  }

  const current = steps.findIndex((s) => s.id === order.status);

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Truck className="size-5 text-brand" /> Physical card delivery
          </span>
        }
        action={
          <span className="text-xs text-ink-3">
            Arriving by {formatDate(order.estimatedDelivery)}
          </span>
        }
      />
      <ol className="mt-2 grid gap-3 sm:grid-cols-4">
        {steps.map((s, i) => {
          const done = i <= current;
          return (
            <li key={s.id} className="flex items-center gap-2.5 sm:grid sm:gap-2">
              <span
                className={cn(
                  'hidden h-1.5 rounded-full sm:block',
                  done ? 'bg-success' : 'bg-surface-3',
                )}
              />
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full border border-line text-[11px] font-semibold',
                    done && 'border-success bg-success text-white',
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn('text-[13px] font-medium', !done && 'text-ink-3')}>
                  {s.label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-[13px] text-ink-2">
        Delivering to {order.address.line1}, {order.address.city}, {order.address.state}. Ordered{' '}
        {formatDate(order.orderedAt)}.
      </p>
    </Card>
  );
}
