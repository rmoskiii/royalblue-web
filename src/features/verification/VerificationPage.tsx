import { useQueryClient } from '@tanstack/react-query';
import { CircleCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { queryKeys, useTierLimits, useVerificationStatus } from '@/api/hooks';
import type { VerificationStepId } from '@/api/types';
import { Button, Card, PageHeader } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { BvnForm } from './components/BvnForm';
import { IdDocumentForm } from './components/IdDocumentForm';
import { ProofOfAddressForm } from './components/ProofOfAddressForm';
import { Stepper } from './components/Stepper';
import { TierLimitsTable } from './components/TierLimitsTable';
import { ADDRESS_LEAD, addressStepLead } from './addressCopy';
import { verificationSteps } from './stepList';

const stepCopy: Record<VerificationStepId, { title: string; lead: string }> = {
  bvn: {
    title: 'Validate your BVN or NIN',
    lead: 'Same check as signup. Your BVN or NIN confirms who you are. We can’t see or move money in your other accounts.',
  },
  'id-document': {
    title: 'Live selfie',
    lead: 'Look at the camera. We confirm you are present, then match this selfie to your BVN or NIN photo. You only photograph an ID if that match fails.',
  },
  'proof-of-address': {
    title: 'Residential address',
    lead: ADDRESS_LEAD,
  },
};

/** PRD View 6: Web KYC & Tier 3 upgrade centre. */
export function VerificationPage() {
  const queryClient = useQueryClient();
  const { data: status } = useVerificationStatus();
  const { data: tiers } = useTierLimits();

  // Steps finished in this session, on top of what the API reports.
  const [justCompleted, setJustCompleted] = useState<VerificationStepId[]>([]);
  const [selected, setSelected] = useState<VerificationStepId | null>(null);
  const [editing, setEditing] = useState(false);

  if (!status || !tiers) return null;

  const completed = new Set([...status.completedSteps, ...justCompleted]);
  const firstIncomplete = verificationSteps.find((s) => !completed.has(s.id))?.id ?? null;
  const active = selected ?? firstIncomplete;
  const allDone = completed.size === verificationSteps.length;
  const currentTier = tiers.find(
    (t) => t.tier === status.tier && Boolean(t.restrictedNoBvn) === Boolean(status.restrictedNoBvn),
  );

  const finish = (id: VerificationStepId) => {
    setJustCompleted((c) => [...c, id]);
    setSelected(null);
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: queryKeys.verification });
    queryClient.invalidateQueries({ queryKey: queryKeys.account });
    queryClient.invalidateQueries({ queryKey: queryKeys.customerProfile });
  };

  const showForm = active && (!completed.has(active) || editing);

  return (
    <>
      <PageHeader title="Account limits" subtitle="Verify your identity to raise your limits." />
      <div className="grid min-w-0 gap-4">
        <Card className="flex min-w-0 flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-text">
            <ShieldCheck className="size-6" />
          </span>
          <div className="min-w-0 lg:flex-[1_1_200px]">
            <p className="text-xs font-semibold tracking-wider text-ink-3 uppercase">Your tier</p>
            <p className="text-2xl font-semibold tracking-tight">
              {status.restrictedNoBvn ? 'Starter' : `Tier ${status.tier}`}
            </p>
            {status.kycStatus && (
              <p className="text-[13px] text-ink-3">
                Verification {status.kycStatus.replaceAll('_', ' ').toLowerCase()}
              </p>
            )}
            {status.identityVerified === false && (status.hasBvn || status.hasNin) && (
              <p className="mt-1 text-[13px] text-amber-800 dark:text-amber-200">
                Identity not confirmed yet. You can retry BVN or NIN below.
              </p>
            )}
          </div>
          {currentTier && (
            <dl className="grid min-w-0 w-full grid-cols-1 gap-3 text-[13px] lg:flex-[2_1_320px] lg:grid-cols-3">
              {[
                ['Per transfer', currentTier.singleTransactionLimit],
                ['Daily limit', currentTier.dailyLimit],
                ['Max balance', currentTier.maxBalance],
              ].map(([label, value]) => (
                <div key={label as string} className="min-w-0">
                  <dt className="text-ink-3">{label}</dt>
                  <dd className="font-semibold break-words tabular">
                    {value === null ? 'Unlimited' : formatNaira(value as number)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <h2 className="mb-4 text-base font-semibold">Upgrade to Tier 3</h2>
          <Stepper
            completed={completed}
            active={active}
            onSelect={(id) => {
              setSelected(id);
              setEditing(false);
            }}
          />

          <div className="mt-6 min-w-0 max-w-2xl">
            {allDone && !selected ? (
              <div className="flex gap-3">
                <CircleCheck className="size-6 shrink-0 text-success" />
                <div>
                  <p className="font-semibold">You’re on Tier 3</p>
                  <p className="text-[13px] text-ink-2">
                    BVN or NIN, a live selfie match, and a confirmed address are on file. Daily and
                    balance caps are off.
                  </p>
                </div>
              </div>
            ) : active ? (
              <>
                <h3 className="text-xl font-semibold tracking-tight text-brand">
                  {stepCopy[active].title}
                </h3>
                <p className="mt-1 mb-4 text-sm text-ink-2">
                  {active === 'proof-of-address'
                    ? addressStepLead(Boolean(status.addressReviewPending))
                    : stepCopy[active].lead}
                </p>
                {!showForm ? (
                  <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-tile bg-success-soft px-4 py-3">
                    <CircleCheck className="size-5 shrink-0 text-success" />
                    <span className="min-w-0 flex-1 font-medium text-success">Verified</span>
                    <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                      Update
                    </Button>
                  </div>
                ) : active === 'bvn' ? (
                  <BvnForm onDone={() => finish('bvn')} />
                ) : active === 'id-document' ? (
                  <IdDocumentForm
                    canMatchOnFile={Boolean(status.hasBvn || status.hasNin)}
                    onDone={() => finish('id-document')}
                  />
                ) : (
                  <ProofOfAddressForm
                    reviewPending={Boolean(status.addressReviewPending)}
                    failedUploads={status.failedAddressUploads ?? 0}
                    currentAddress={status.claimedAddress}
                    lastRegistryAddress={status.registryAddress}
                    billName={status.latestBillName}
                    onDone={() => finish('proof-of-address')}
                  />
                )}
              </>
            ) : null}
          </div>
        </Card>

        <section className="min-w-0">
          <h2 className="mb-2.5 text-base font-semibold">Tiers and limits</h2>
          <TierLimitsTable tiers={tiers} current={status.tier} restrictedNoBvn={status.restrictedNoBvn} />
        </section>
      </div>
    </>
  );
}
