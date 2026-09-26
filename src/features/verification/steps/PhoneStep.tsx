import { TextField } from '@/components/ui';
import { StepHeading } from '../StepHeading';
import type { StepProps } from '../types';

export function PhoneStep({ form, update }: StepProps) {
  return (
    <>
      <StepHeading title="Phone number" lead="We’ll send a 6-digit code to confirm it’s yours." />
      <TextField
        label="Phone number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        prefix="+234"
        maxLength={10}
        placeholder="8034564521"
        value={form.phone}
        onChange={(e) => update({ phone: e.target.value.replace(/\D/g, '').replace(/^0/, '') })}
        inputClassName="pl-15 tabular"
      />
    </>
  );
}
