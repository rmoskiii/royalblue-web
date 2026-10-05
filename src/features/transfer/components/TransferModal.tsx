import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { Beneficiary, TransferResult } from '@/api/types';
import { CloseButton, Modal } from '@/components/ui';
import type { TransferDraft } from '../types';
import { ApproveStep } from './ApproveStep';
import { TransferDetailsStep } from './TransferDetailsStep';
import { TransferSuccess } from './TransferSuccess';

type Step =
  | { name: 'details' }
  | { name: 'approve'; draft: TransferDraft }
  | { name: 'success'; draft: TransferDraft; result: TransferResult };

const titles: Record<Step['name'], string> = {
  details: 'Send money',
  approve: 'Approve transfer',
  success: 'Transfer sent',
};

/** PRD View 3: centred card on every screen size. */
export function TransferModal({
  initial,
  preset,
  onClose,
}: {
  initial?: Beneficiary;
  preset?: TransferDraft;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(
    preset ? { name: 'approve', draft: preset } : { name: 'details' },
  );

  return (
    <Modal open onClose={onClose} title={titles[step.name]} hideHeader>
      <div className="flex shrink-0 items-center gap-2 px-4 pt-3">
        {step.name === 'approve' && (
          <button
            type="button"
            aria-label="Back"
            onClick={() => (preset ? onClose() : setStep({ name: 'details' }))}
            className="grid size-9.5 place-items-center rounded-field text-ink-2 hover:bg-surface-2"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <h2 className="min-w-0 truncate text-lg font-semibold">{titles[step.name]}</h2>
        <CloseButton onClick={onClose} className="ml-auto" />
      </div>

      <div className="px-4 pt-2 pb-4">
        {/* Details stay mounted while approving so Back keeps what was typed. */}
        <div hidden={step.name !== 'details'}>
          <TransferDetailsStep
            initial={initial}
            onContinue={(draft) => setStep({ name: 'approve', draft })}
          />
        </div>
        {step.name === 'approve' && (
          <ApproveStep
            draft={step.draft}
            onSent={(result) => setStep({ name: 'success', draft: step.draft, result })}
          />
        )}
        {step.name === 'success' && (
          <TransferSuccess draft={step.draft} result={step.result} onDone={onClose} />
        )}
      </div>
    </Modal>
  );
}
