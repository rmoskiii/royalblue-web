import { Copy, Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';
import { useCardSecrets, useCards } from '@/api/hooks';
import type { Card } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import { copyText } from '@/lib/clipboard';
import { CardControlsPanel } from './components/CardControlsPanel';
import { CardVisual } from './components/CardVisual';
import { PhysicalCardSection } from './components/PhysicalCardSection';

const REVEAL_SECONDS = 30;

/** PRD View 5: virtual card hub and physical card portal. */
export function CardsPage() {
  const { data: cards, isLoading } = useCards();
  const card = cards?.find((c) => c.kind === 'virtual');

  return (
    <>
      <PageHeader
        title="Cards"
        subtitle="Your virtual card works anywhere Visa is accepted online."
      />
      {isLoading ? (
        <div className="h-60 animate-pulse rounded-card bg-surface-2" />
      ) : !card ? (
        <EmptyState title="You don’t have a card yet" />
      ) : (
        <div className="grid gap-4">
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <VirtualCardSection card={card} />
            <CardControlsPanel key={card.id} card={card} />
          </div>
          <PhysicalCardSection />
        </div>
      )}
    </>
  );
}

function VirtualCardSection({ card }: { card: Card }) {
  const { showToast } = useToast();
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const { data: secrets, isFetching } = useCardSecrets(card.id, revealed);

  const toggleReveal = () => {
    window.clearTimeout(timer.current);
    if (revealed) return setRevealed(false);
    setRevealed(true);
    // Hide sensitive details again automatically.
    timer.current = window.setTimeout(() => setRevealed(false), REVEAL_SECONDS * 1000);
  };

  return (
    <div className="grid gap-4">
      <CardVisual card={card} secrets={revealed ? secrets : undefined} />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={toggleReveal} disabled={card.frozen}>
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {revealed ? 'Hide details' : isFetching ? 'Loading…' : 'Show details'}
        </Button>
        {revealed && secrets && (
          <>
            <span className="rounded-field bg-surface-2 px-3 py-2 text-sm">
              CVV <b className="font-semibold tabular">{secrets.cvv}</b>
            </span>
            <Button
              variant="ghost"
              onClick={async () => {
                await copyText(secrets.pan.replace(/\s/g, ''));
                showToast('Card number copied');
              }}
            >
              <Copy className="size-4" /> Copy number
            </Button>
          </>
        )}
      </div>
      {revealed && (
        <p className="text-xs text-ink-3">Details hide again after {REVEAL_SECONDS} seconds.</p>
      )}
    </div>
  );
}
