import { useTerminals } from '@/api/hooks';
import { Card, CardHeader, Chip } from '@/components/ui';
import { formatTime } from '@/lib/format';

export function TerminalsCard() {
  const { data: terminals } = useTerminals();

  return (
    <Card>
      <CardHeader title="POS terminals" />
      <ul className="grid gap-2">
        {terminals?.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{t.label}</span>
              <span className="block text-xs text-ink-3 tabular">
                {t.serial}
                {t.lastTransactionAt && ` · last payment ${formatTime(t.lastTransactionAt)}`}
              </span>
            </span>
            <Chip tone={t.status === 'online' ? 'success' : 'neutral'}>
              {t.status === 'online' ? 'Online' : 'Offline'}
            </Chip>
          </li>
        ))}
      </ul>
    </Card>
  );
}
