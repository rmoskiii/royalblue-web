import {
  Bell,
  CircleHelp,
  Copy,
  CreditCard,
  FileText,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAccount, useCustomerProfile, useMe } from '@/api/hooks';
import { isStaffRole } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { useLogoutConfirm } from '@/components/layout/LogoutProvider';
import { paths } from '@/components/layout/navigation';
import { Avatar, Button, Card, Chip, PageHeader } from '@/components/ui';
import { formatAccountNumber } from '@/lib/format';
import { TierBanner } from '@/features/home/components/TierBanner';
import { SettingsRow } from './SettingsRow';

export function SettingsPage() {
  const { data: me } = useMe();
  const { data: profile } = useCustomerProfile();
  const { data: account } = useAccount();
  const { showToast } = useToast();
  const { requestLogout } = useLogoutConfirm();
  const staff = isStaffRole(me?.role);
  const name = [profile?.user.firstName, profile?.user.lastName].filter(Boolean).join(' ') || me?.displayName || me?.email || '';
  const phone = profile?.user.phone || '';
  const wallet = profile?.accounts[0] ?? (account?.accountNumber
    ? { accountNumber: account.accountNumber, accountName: account.accountName, bankName: account.bankName, status: 'ACTIVE', id: 'primary' }
    : null);
  const kyc = profile?.applicant?.kycStatus?.replaceAll('_', ' ');

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    showToast(`${label} copied`);
  };

  return (
    <>
      <PageHeader title="Me" subtitle="Profile, security and how RoyalBlue talks to you." />
      <div className="mx-auto grid max-w-xl gap-4">
        {!staff && <TierBanner />}
        <Card className="grid gap-4 p-5">
          <div className="flex items-start gap-3">
            <Avatar name={name || 'RB'} size="lg" className="size-14 text-base bg-navy text-white" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">{name || 'RoyalBlue user'}</p>
              <p className="text-[13px] text-ink-2">{phone || me?.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {staff && me?.role && <Chip>{me.role.replaceAll('_', ' ')}</Chip>}
                {!staff && kyc && <Chip tone={kyc === 'VERIFIED' ? 'success' : 'warning'}>{kyc}</Chip>}
                {!staff && account && (
                  <Chip>{account.restrictedNoBvn ? 'Starter' : `Tier ${account.tier}`}</Chip>
                )}
              </div>
            </div>
          </div>
          {wallet && wallet.accountNumber !== '—' && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Account number</p>
                <p className="font-semibold tabular">{formatAccountNumber(wallet.accountNumber)}</p>
                <p className="text-[13px] text-ink-3">{wallet.bankName}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copy(wallet.accountNumber, 'Account number')}
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden p-0">
          {!staff && (
            <SettingsRow
              to={paths.settingsProfile}
              icon={UserRound}
              label="Personal details"
              value={profile?.individual?.city || profile?.individual?.state || undefined}
            />
          )}
          <SettingsRow
            to={paths.settingsSecurity}
            icon={LockKeyhole}
            label="Login & security"
          />
          {!staff && (
            <SettingsRow
              to={paths.verification}
              icon={ShieldCheck}
              label="Identity & limits"
              value={
                account?.restrictedNoBvn ? 'Starter ₦50k' : account ? `Tier ${account.tier}` : kyc
              }
            />
          )}
          {!staff && (
            <SettingsRow to={paths.settingsPayments} icon={CreditCard} label="Payment methods" />
          )}
          <SettingsRow to={paths.settingsNotifications} icon={Bell} label="Notifications" />
        </Card>

        <Card className="overflow-hidden p-0">
          <SettingsRow to={paths.help} icon={CircleHelp} label="Help & support" />
          <SettingsRow href={paths.terms} icon={FileText} label="Terms of service" />
          <SettingsRow href={paths.privacy} icon={FileText} label="Privacy policy" />
        </Card>

        <p className="text-center text-xs text-ink-3">RoyalBlue MFB · web 0.1.0</p>
        <Button variant="secondary" block onClick={requestLogout}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </>
  );
}
