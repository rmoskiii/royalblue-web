import type { IdDocumentType } from '@/api/types';
import { SelectField, TextField } from '@/components/ui';
import { StepHeading } from '../StepHeading';
import type { StepProps } from '../types';

const idTypes: { value: IdDocumentType; label: string; placeholder: string }[] = [
  { value: 'nin', label: 'National Identity Number (NIN)', placeholder: '11-digit NIN' },
  { value: 'drivers-licence', label: 'Driver’s licence', placeholder: 'Licence number' },
  { value: 'passport', label: 'International passport', placeholder: 'Passport number' },
  { value: 'voters-card', label: 'Voter’s card', placeholder: 'VIN' },
];

export function IdDocumentStep({ form, update }: StepProps) {
  const current = idTypes.find((t) => t.value === form.idType) ?? idTypes[0];
  return (
    <>
      <StepHeading
        title="ID document"
        lead="Add a government-issued ID that matches your BVN name."
      />
      <div className="grid gap-4">
        <SelectField
          label="ID type"
          value={form.idType}
          onChange={(e) => update({ idType: e.target.value as IdDocumentType, idNumber: '' })}
          options={idTypes}
        />
        <TextField
          label="ID number"
          autoComplete="off"
          placeholder={current.placeholder}
          value={form.idNumber}
          onChange={(e) => update({ idNumber: e.target.value })}
        />
      </div>
    </>
  );
}
