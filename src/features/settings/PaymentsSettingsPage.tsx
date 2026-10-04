import { Link } from 'react-router';
import { useCustomerProfile } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { Button, Card, Chip, PageHeader } from '@/components/ui';
import { formatAccountNumber } from '@/lib/format';
import { SettingsBack } from './SettingsBack';

export function PaymentsSettingsPage() {
  const { data } = useCustomerProfile();
  const salary = data?.individual;

  return (
    <>
      <SettingsBack />
      <PageHeader title="Payment methods" subtitle="Wallets and the salary account we can debit for loans." />
      <div className="mx-auto grid max-w-xl gap-3">
        {(data?.accounts ?? []).map((account) => (
          <Card key={account.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{account.accountName}</p>
              <p className="text-[13px] text-ink-2">
                {formatAccountNumber(account.accountNumber)} · {account.bankName}
              </p>
            </div>
            <Chip tone={account.status === 'ACTIVE' ? 'success' : 'warning'}>{account.status}</Chip>
          </Card>
        ))}
        <Card className="grid gap-2">
          <h2 className="font-semibold">Linked salary account</h2>
          {salary?.accountNumber ? (
            <p className="text-sm text-ink-2">
              {salary.accountName || salary.bankName} · {salary.accountNumber}
            </p>
          ) : (
            <p className="text-sm text-ink-3">Add a salary account on your personal details for payroll loans.</p>
          )}
          <Link to={paths.settingsProfile}>
            <Button variant="secondary" size="sm">
              Update
            </Button>
          </Link>
        </Card>
        <Card>
          <p className="font-semibold">Cards</p>
          <p className="mt-1 text-[13px] text-ink-3">Virtual and physical cards live on the Cards tab.</p>
          <Link to={paths.cards} className="mt-3 inline-block">
            <Button variant="secondary" size="sm">
              Open cards
            </Button>
          </Link>
        </Card>
      </div>
    </>
  );
}
