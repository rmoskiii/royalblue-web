import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { verificationService } from '@/api/services/verification';
import type { VerificationStepId } from '@/api/types';
import { Button, CloseButton, Modal, ProgressBar } from '@/components/ui';
import { cn } from '@/lib/cn';
import { StepHeading } from './StepHeading';
import { verificationSteps } from './stepList';
import { AccountTypeStep } from './steps/AccountTypeStep';
import { BvnStep } from './steps/BvnStep';
import { IdDocumentStep } from './steps/IdDocumentStep';
import { PhoneStep } from './steps/PhoneStep';
import { ProofOfAddressStep } from './steps/ProofOfAddressStep';
import type { VerificationForm } from './types';

const initialForm: VerificationForm = {
  accountType: 'personal',
  bvn: '',
  idType: 'nin',
  idNumber: '',
  proofOfAddress: null,
  phone: '',
};

/** Validation per step: returns true when Next can be pressed. */
const isStepValid: Record<VerificationStepId, (f: VerificationForm) => boolean> = {
  'account-type': () => true,
  bvn: (f) => /^\d{11}$/.test(f.bvn),
  'id-document': (f) => f.idNumber.trim().length >= 6,
  'proof-of-address': (f) => f.proofOfAddress !== null,
  phone: (f) => /^\d{10}$/.test(f.phone),
};

/** Sends the current step to the API. */
function submitStep(step: VerificationStepId, f: VerificationForm) {
  switch (step) {
    case 'account-type':
      return verificationService.setAccountType(f.accountType);
    case 'bvn':
      return verificationService.submitBvn(f.bvn);
    case 'id-document':
      return verificationService.submitIdDocument(f.idType, f.idNumber);
    case 'proof-of-address':
      return verificationService.uploadProofOfAddress(f.proofOfAddress as File);
    case 'phone':
      return verificationService.sendPhoneCode(`+234${f.phone}`);
  }
}

export function VerificationModal({
  startStep,
  onClose,
}: {
  startStep: VerificationStepId;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(verificationSteps.findIndex((s) => s.id === startStep));
  const [form, setForm] = useState(initialForm);
  const done = index >= verificationSteps.length;
  const step = verificationSteps[Math.min(index, verificationSteps.length - 1)];

  const update = (patch: Partial<VerificationForm>) => setForm((f) => ({ ...f, ...patch }));

  const submit = useMutation({
    mutationFn: () => submitStep(step.id, form),
    onSuccess: () => {
      setIndex((i) => i + 1);
      if (index === verificationSteps.length - 1) {
        queryClient.invalidateQueries({ queryKey: queryKeys.verification });
      }
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Verify your account"
      hideHeader
      className="md:w-[min(780px,100%)]"
    >
      <div className="grid md:h-[min(560px,90dvh)] md:grid-cols-[210px_minmax(0,1fr)]">
        {/* Step rail (tablet and up) */}
        <aside className="hidden flex-col bg-surface-2 px-4 py-4.5 md:flex">
          <CloseButton onClick={onClose} className="bg-surface" />
          <ol className="mt-4.5 grid gap-0.5">
            {verificationSteps.map((s, i) => {
              const state = done || i < index ? 'done' : i === index ? 'current' : 'todo';
              return (
                <li
                  key={s.id}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 px-1.5 py-2 text-[13px] font-medium',
                    state === 'todo' && 'text-ink-3',
                    state === 'current' && 'text-ink',
                    state === 'done' && 'text-ink-2',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-full border border-line bg-surface text-[11px] tabular',
                      state === 'current' && 'border-primary text-primary-text',
                      state === 'done' && 'border-success bg-success text-white',
                    )}
                  >
                    {state === 'done' ? (
                      <Check className="size-3.5" />
                    ) : (
                      String(i + 1).padStart(2, '0')
                    )}
                  </span>
                  {s.label}
                </li>
              );
            })}
          </ol>
          <p className="mt-auto text-[11px] text-ink-3">Licensed by the Central Bank of Nigeria</p>
        </aside>

        <div className="flex min-h-0 flex-col overflow-auto px-5.5 pt-5 pb-5.5">
          {/* Progress (phones) */}
          <div className="mb-3.5 flex items-center gap-2.5 text-xs text-ink-3 md:hidden">
            <span>{done ? 'Complete' : `Step ${index + 1} of ${verificationSteps.length}`}</span>
            <ProgressBar
              value={done ? 1 : (index + 1) / verificationSteps.length}
              label="Verification progress"
              className="h-1.5 flex-1"
            />
            <CloseButton onClick={onClose} />
          </div>

          {done ? (
            <DoneStep />
          ) : (
            <>
              {step.id === 'account-type' && <AccountTypeStep form={form} update={update} />}
              {step.id === 'bvn' && <BvnStep form={form} update={update} />}
              {step.id === 'id-document' && <IdDocumentStep form={form} update={update} />}
              {step.id === 'proof-of-address' && <ProofOfAddressStep form={form} update={update} />}
              {step.id === 'phone' && <PhoneStep form={form} update={update} />}
              {submit.isError && (
                <p className="mt-3 text-[13px] text-primary-text">{submit.error.message}</p>
              )}
            </>
          )}

          <div className="mt-auto flex gap-2 pt-4.5">
            {done ? (
              <Button onClick={onClose}>Back to home</Button>
            ) : (
              <>
                {index > 0 && (
                  <Button variant="secondary" onClick={() => setIndex((i) => i - 1)}>
                    Back
                  </Button>
                )}
                <Button
                  disabled={!isStepValid[step.id](form) || submit.isPending}
                  onClick={() => submit.mutate()}
                >
                  {submit.isPending ? 'Saving…' : step.id === 'phone' ? 'Send code' : 'Next'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DoneStep() {
  return (
    <div>
      <span className="mb-3.5 grid size-14 place-items-center rounded-full bg-success-soft text-success">
        <Check className="size-6" />
      </span>
      <StepHeading
        title="You’re all set"
        lead="We’re reviewing your documents. Most checks finish within a few minutes, and we’ll let you know when your account is upgraded."
      />
    </div>
  );
}
