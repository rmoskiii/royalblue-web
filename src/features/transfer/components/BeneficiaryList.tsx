import { useBeneficiaries } from '@/api/hooks';
import type { Beneficiary } from '@/api/types';
import { Avatar, Card, CardHeader } from '@/components/ui';
import { useToast } from '@/app/providers/ToastProvider';

const avatarColours = ['#6B3FA0', '#E07B00', '#C93C38', '#1C6FB8', '#5B2C83', '#0E7C66'];

/** Horizontal scroller on phones and tablets, two-column list on wide screens. */
export function BeneficiaryList({
  onSelect,
  className,
}: {
  onSelect: (b: Beneficiary) => void;
  className?: string;
}) {
  const { data: beneficiaries } = useBeneficiaries();
  const { showToast } = useToast();

  return (
    <Card className={className}>
      <CardHeader
        title="Beneficiaries"
        action={
          <button
            type="button"
            className="text-[13px] font-medium text-primary-text"
            onClick={() => showToast('Managing beneficiaries is coming soon')}
          >
            Manage
          </button>
        }
      />
      <ul className="flex gap-2.5 overflow-x-auto pb-1 xl:grid xl:grid-cols-2 xl:overflow-visible">
        {beneficiaries?.map((b, i) => (
          <li key={b.id} className="shrink-0 basis-19.5 xl:basis-auto">
            <button
              type="button"
              onClick={() => onSelect(b)}
              className="flex w-full min-w-0 flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-center hover:bg-surface-2 xl:flex-row xl:gap-3 xl:p-2.5 xl:text-left"
            >
              <Avatar name={b.name} color={avatarColours[i % avatarColours.length]} size="lg" />
              <span className="w-full min-w-0">
                <span className="block truncate text-xs font-medium xl:text-sm">{b.name}</span>
                <span className="hidden truncate text-xs text-ink-3 xl:block">
                  {b.accountNumber} · {b.bankName}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
