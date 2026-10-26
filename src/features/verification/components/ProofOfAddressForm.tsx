import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { verificationService } from '@/api/services/verification';
import { Button, TextField } from '@/components/ui';
import { ADDRESS_FIELD_HINT, BILL_UPLOAD_HINT } from '../addressCopy';
import { FileDrop } from './FileDrop';

export function ProofOfAddressForm({
  onDone,
  onSkip,
  persist = true,
  reviewPending = false,
  failedUploads = 0,
  currentAddress = '',
  billName,
}: {
  onDone: (file?: File, address?: string) => void;
  onSkip?: () => void;
  persist?: boolean;
  reviewPending?: boolean;
  failedUploads?: number;
  currentAddress?: string | null;
  lastRegistryAddress?: string | null;
  billName?: string | null;
  onAddressConfirmed?: (address: string) => void;
}) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [address, setAddress] = useState(currentAddress ?? '');
  useEffect(() => {
    if (currentAddress) setAddress(currentAddress);
  }, [currentAddress]);
  const [note, setNote] = useState('');
  const [askedReview, setAskedReview] = useState(reviewPending);
  const line = address.trim();
  const canSaveAddress = line.length >= 8;

  const submit = useMutation({
    mutationFn: async () => {
      const next = file as File;
      if (!persist) return { file: next, queued: false, verified: false };
      if (canSaveAddress) await verificationService.confirmAddress(line);
      const status = await verificationService.uploadProofOfAddress(next);
      return {
        file: next,
        queued: Boolean(status.addressReviewPending) && !status.addressVerified,
        verified: Boolean(status.addressVerified),
      };
    },
    onSuccess: ({ file: next, queued, verified }) => {
      if (queued) {
        setAskedReview(true);
        queryClient.invalidateQueries({ queryKey: queryKeys.verification });
        return;
      }
      onDone(next, line);
      if (verified) queryClient.invalidateQueries({ queryKey: queryKeys.verification });
    },
  });
  const review = useMutation({
    mutationFn: async () => {
      if (!persist) return;
      if (canSaveAddress) await verificationService.confirmAddress(line);
      if (file) {
        const status = await verificationService.uploadProofOfAddress(file);
        if (status.addressVerified) return status;
      }
      return verificationService.requestAddressReview(note);
    },
    onSuccess: (status) => {
      if (!persist) {
        onDone(file ?? undefined, line);
        return;
      }
      setAskedReview(!status?.addressVerified);
      queryClient.invalidateQueries({ queryKey: queryKeys.verification });
      if (status?.addressVerified) onDone(file ?? undefined, line);
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (file && canSaveAddress) submit.mutate();
      }}
    >
      <TextField
        label="Where you live now"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Street, area, city, state"
        hint={ADDRESS_FIELD_HINT}
      />
      {billName && <p className="text-[13px] text-ink-2">Bill on file: {billName}</p>}
      <p className="text-[13px] text-ink-2">{BILL_UPLOAD_HINT}</p>
      <FileDrop value={file} onChange={setFile} />
      {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
      {askedReview && persist && (
        <p className="rounded-tile bg-amber-500/10 px-4 py-3 text-[13px] text-amber-900 dark:text-amber-200">
          Staff have your file and will confirm it against the address you entered. You’re still on
          your current tier until they approve.
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="justify-self-stretch sm:justify-self-start disabled:opacity-80"
        disabled={!file || !canSaveAddress || submit.isPending}
      >
        {submit.isPending ? 'Uploading…' : persist ? 'Upload a utility bill' : 'Continue with this bill'}
      </Button>
      <div className="grid gap-2">
        {(failedUploads > 0 || askedReview || persist) && (
          <label className="grid gap-1 text-[13px] text-ink-2">
            Note for staff (optional)
            <textarea
              className="min-h-20 rounded-tile border border-surface-3 bg-surface px-3 py-2 text-sm text-ink"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. the bill is in my name with a spelling difference"
            />
          </label>
        )}
        <Button
          type="button"
          variant="secondary"
          className="justify-self-start"
          disabled={!canSaveAddress || (!file && !billName) || review.isPending || askedReview}
          onClick={() => review.mutate()}
        >
          {askedReview ? 'Sent for review' : review.isPending ? 'Sending…' : 'Send for review'}
        </Button>
        {review.isError && <p className="text-[13px] text-primary-text">{review.error.message}</p>}
      </div>
      {onSkip && (
        <button type="button" className="justify-self-start text-sm font-medium text-ink-2" onClick={onSkip}>
          Skip for now — finish later in Account limits
        </button>
      )}
    </form>
  );
}
