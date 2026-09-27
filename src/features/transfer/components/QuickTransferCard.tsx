import { Plus } from 'lucide-react';
import { useBeneficiaries } from '@/api/hooks';
import { Avatar, Card, CardHeader } from '@/components/ui';
import { avatarColour } from '../lib/avatarColour';
import { useTransfer } from '../TransferProvider';

/** Home right column (PRD View 1): quick transfer to saved beneficiaries. */
export function QuickTransferCard() {
  const { data: beneficiaries } = useBeneficiaries();
  const { openTransfer } = useTransfer();

  return (
    <Card>
      <CardHeader
        title="Quick transfer"
        action={
          <button
            type="button"
            onClick={() => openTransfer()}
            className="text-[13px] font-medium text-primary-text"
          >
            New transfer
          </button>
        }
      />
      <ul className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-3">
        <li>
          <button
            type="button"
            onClick={() => openTransfer()}
            className="flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2 hover:bg-surface-2"
          >
            <span className="grid size-11 place-items-center rounded-full border-[1.5px] border-dashed border-ink-3 text-ink-2">
              <Plus className="size-5" />
            </span>
            <span className="text-xs">New</span>
          </button>
        </li>
        {beneficiaries?.slice(0, 5).map((b, i) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => openTransfer(b)}
              title={`${b.name} · ${b.bankName}`}
              className="flex w-full min-w-0 flex-col items-center gap-1.5 rounded-xl px-1 py-2 hover:bg-surface-2"
            >
              <Avatar name={b.name} color={avatarColour(i)} size="lg" />
              <span className="w-full truncate text-center text-xs">{b.name.split(' ')[0]}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
