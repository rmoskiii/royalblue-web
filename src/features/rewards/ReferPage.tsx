import { Copy, Share2 } from 'lucide-react';
import { useMe } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { paths } from '@/components/layout/navigation';
import { Button, Card, PageHeader } from '@/components/ui';
import { copyText, shareOrCopy } from '@/lib/clipboard';

export function referralCodeFor(userId: string) {
  const compact = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || 'HOME';
  return `RB${compact}`;
}

export function ReferPage() {
  const { data: me } = useMe();
  const { showToast } = useToast();
  const code = referralCodeFor(me?.id ?? 'guest');
  const inviteUrl =
    typeof window === 'undefined'
      ? paths.signUp
      : `${window.location.origin}${paths.signUp}?ref=${encodeURIComponent(code)}`;

  return (
    <div className="mx-auto grid min-w-0 max-w-xl gap-4">
      <PageHeader
        title="Refer and earn"
        subtitle="Share your sign-up link. Cashback for referrals isn’t paying out yet."
      />
      <Card className="grid gap-3">
        <p className="text-[13px] font-medium text-ink-3">Your code</p>
        <p className="break-all text-3xl font-semibold tracking-wide text-brand">{code}</p>
        <p className="min-w-0 truncate text-[13px] text-ink-2">{inviteUrl}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await copyText(code);
              showToast('Code copied');
            }}
          >
            <Copy className="size-4" />
            Copy code
          </Button>
          <Button
            onClick={async () => {
              const outcome = await shareOrCopy(
                'Join me on RoyalBlue',
                `Use my code ${code} when you open a RoyalBlue account: ${inviteUrl}`,
              );
              if (outcome === 'copied') showToast('Invite link copied');
            }}
          >
            <Share2 className="size-4" />
            Share link
          </Button>
        </div>
      </Card>
      <Card>
        <ol className="grid gap-3 text-sm">
          <li>
            <b className="text-brand">1.</b> They open an account with your link or code.
          </li>
          <li>
            <b className="text-brand">2.</b> They fund the account from their bank.
          </li>
          <li>
            <b className="text-brand">3.</b> When referral cashback launches, both of you will see
            it here — this preview does not pay naira today.
          </li>
        </ol>
      </Card>
    </div>
  );
}
