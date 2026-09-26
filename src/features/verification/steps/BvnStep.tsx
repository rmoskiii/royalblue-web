import { CircleHelp } from 'lucide-react';
import { TextField } from '@/components/ui';
import { StepHeading } from '../StepHeading';
import type { StepProps } from '../types';

export function BvnStep({ form, update }: StepProps) {
  return (
    <>
      <StepHeading
        title="Verify your BVN"
        lead="Your Bank Verification Number confirms your identity. We can’t see or move money in your other accounts."
      />
      <TextField
        label="BVN"
        inputMode="numeric"
        autoComplete="off"
        maxLength={11}
        placeholder="11-digit BVN"
        value={form.bvn}
        onChange={(e) => update({ bvn: e.target.value.replace(/\D/g, '') })}
        inputClassName="tabular"
      />
      <p className="mt-3 flex gap-2.5 rounded-xl bg-surface-2 p-3 text-[13px] text-ink-2">
        <CircleHelp className="size-4 shrink-0" />
        Don’t know your BVN? Dial *565*0# from the phone number linked to your bank account.
      </p>
    </>
  );
}
