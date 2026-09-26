import { Upload } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { StepHeading } from '../StepHeading';
import type { StepProps } from '../types';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.jpg,.jpeg,.png';

export function ProofOfAddressStep({ form, update }: StepProps) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('That file is over 5 MB. Try a smaller scan or photo.');
      return;
    }
    setError(null);
    update({ proofOfAddress: file });
  };

  return (
    <>
      <StepHeading
        title="Proof of address"
        lead="Upload a utility bill or bank statement from the last 3 months."
      />
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          'grid cursor-pointer place-items-center gap-1.5 rounded-tile border-[1.5px] border-dashed border-surface-3 px-3.5 py-6.5 text-center text-[13px] text-ink-2 hover:border-brand',
          dragging && 'border-brand bg-surface-2',
        )}
      >
        <Upload className="size-5" />
        <b className="font-semibold text-ink">
          {form.proofOfAddress?.name ?? 'Choose a file or drag it here'}
        </b>
        <span className="text-ink-3">PDF, JPG or PNG, up to 5 MB</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-xs text-primary-text">{error}</p>}
    </>
  );
}
