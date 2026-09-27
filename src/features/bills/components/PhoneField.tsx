import { TextField } from '@/components/ui';

/** Nigerian mobile number, stored as 10 digits without the leading 0. */
export function PhoneField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <TextField
      label="Phone number"
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      prefix="+234"
      maxLength={10}
      placeholder="8034564521"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').replace(/^0/, ''))}
      inputClassName="pl-15 tabular"
    />
  );
}
