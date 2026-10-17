import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { verificationService } from '@/api/services/verification';
import { Button } from '@/components/ui';
import { FileDrop } from './FileDrop';

export function ProofOfAddressForm({
  onDone,
  onSkip,
  persist = true,
}: {
  onDone: (file: File) => void;
  onSkip?: () => void;
  persist?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const submit = useMutation({
    mutationFn: async () => {
      const next = file as File;
      if (persist) await verificationService.uploadProofOfAddress(next);
      return next;
    },
    onSuccess: onDone,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (file) submit.mutate();
      }}
    >
      <p className="text-[13px] text-ink-2">
        A utility bill (electricity, water or waste) or a bank statement from the last 3 months,
        showing your name and address.
      </p>
      <FileDrop value={file} onChange={setFile} />
      {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
      <Button type="submit" className="justify-self-start" disabled={!file || submit.isPending}>
        {submit.isPending ? 'Uploading…' : persist ? 'Submit document' : 'Continue'}
      </Button>
      {onSkip && (
        <button type="button" className="justify-self-start text-sm font-medium text-ink-2" onClick={onSkip}>
          Skip for now — finish later in Account limits
        </button>
      )}
    </form>
  );
}
