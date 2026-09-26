import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, buttonClass } from '@/components/ui';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';

export function ReferCard() {
  const { showToast } = useToast();
  return (
    <section className="relative overflow-hidden rounded-card bg-navy-600 p-4.5 text-white">
      <LeafArt />
      <h3 className="font-display text-2xl font-medium tracking-tight">Refer and earn</h3>
      <p className="relative mt-1.5 mb-3.5 max-w-[30ch] text-[13px] text-white/78">
        Your friend gets ₦500 when they sign up. You get ₦1,000 cashback after their first
        transaction.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="relative border-white/85 text-white hover:bg-white/10"
        onClick={() => showToast('Invites are coming soon')}
      >
        Invite friends
      </Button>
    </section>
  );
}

export function VirtualCardPromo() {
  return (
    <Card>
      <div className="mb-3.5 flex h-24 flex-col justify-between rounded-xl bg-[linear-gradient(135deg,#272570,#1B194D_60%,#4a2140)] px-3.5 py-3 text-white">
        <div className="flex justify-between text-xs opacity-85">
          <span>RoyalBlue</span>
          <span>Virtual</span>
        </div>
        <span className="text-[15px] tracking-[0.12em] tabular">•••• 4821</span>
      </div>
      <h3 className="font-display text-[22px] font-medium text-brand">Get a virtual card</h3>
      <p className="mt-1.5 mb-3.5 text-[13px] text-ink-2">
        Pay online in naira, set spending limits and freeze it any time.
      </p>
      <Link to={paths.cards} className={buttonClass({ variant: 'outline', size: 'sm' })}>
        Create card
      </Link>
    </Card>
  );
}

function LeafArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 100"
      fill="none"
      stroke="#E05550"
      strokeWidth="3"
      strokeLinecap="round"
      className="absolute -right-1.5 -bottom-2 h-25 w-30"
    >
      <path d="M18 92C22 48 58 18 112 14c2 44-30 78-94 78Z" />
      <path d="M18 92 96 30" />
      <path d="M40 74l-2-24M58 60l-1-26M76 46l2-22M40 74l26 2M58 60l28 2M76 46l24 2" />
    </svg>
  );
}
