import { useState } from 'react';
import { Button, PinPad } from '@/components/ui';
import { submitOnEnter } from '../lib/submitOnEnter';

export function PinStep({ onDone }: { onDone: (pin: string) => void }) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');

  return (
    <form
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        if (stage === 'create') {
          if (pin.length !== 6) return;
          setStage('confirm');
          return;
        }
        if (confirm !== pin) {
          setError('PINs don’t match. Try again.');
          setConfirm('');
          return;
        }
        onDone(pin);
      }}
    >
      <p className="text-sm text-ink-3">
        {stage === 'create'
          ? 'This PIN confirms transfers, bill payments and payouts. You can change it later in Settings.'
          : 'Enter the same PIN once more.'}
      </p>
      <PinPad
        length={6}
        value={stage === 'create' ? pin : confirm}
        onChange={(value) => {
          setError('');
          if (stage === 'create') setPin(value);
          else setConfirm(value);
        }}
        onComplete={(value) => {
          if (stage === 'create') {
            setPin(value);
          } else {
            setConfirm(value);
          }
        }}
      />
      {error && <p className="text-[13px] text-primary-text">{error}</p>}
      <Button type="submit" size="lg" block disabled={(stage === 'create' ? pin : confirm).length !== 6}>
        {stage === 'create' ? 'Continue' : 'Confirm PIN'}
      </Button>
    </form>
  );
}
