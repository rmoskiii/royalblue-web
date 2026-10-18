import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { verificationService } from '@/api/services/verification';
import { Button, TextField } from '@/components/ui';
import { billToggleLabel, lastRegistryHint } from '../addressCopy';
import { FileDrop } from './FileDrop';

export function ProofOfAddressForm({
  onDone,
  onSkip,
  persist = true,
  reviewPending = false,
  failedUploads = 0,
  currentAddress = '',
  lastRegistryAddress,
  billName,
  onAddressConfirmed,
}: {
  onDone: (file?: File) => void;
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
  const ninHint = lastRegistryHint(address, lastRegistryAddress);
  const [note, setNote] = useState('');
  const [askedReview, setAskedReview] = useState(reviewPending);
  const [showBill, setShowBill] = useState(false);
  const submit = useMutation({
    mutationFn: async () => {
      const next = file as File;
      if (!persist) return { file: next, queued: false };
      const status = await verificationService.uploadProofOfAddress(next);
      return { file: next, queued: Boolean(status.addressReviewPending) && !status.addressVerified };
    },
    onSuccess: ({ file: next, queued }) => {
      if (queued) {
        setAskedReview(true);
        queryClient.invalidateQueries({ queryKey: queryKeys.verification });
        return;
      }
      onDone(next);
    },
  });
  const confirm = useMutation({
    mutationFn: async () => {
      const line = address.trim();
      if (!persist) {
        onAddressConfirmed?.(line);
        return { queued: false };
      }
      const status = await verificationService.confirmAddress(line);
      return { queued: Boolean(status.addressReviewPending) && !status.addressVerified };
    },
    onSuccess: ({ queued }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.verification });
      if (queued) {
        setAskedReview(true);
        return;
      }
      onDone();
    },
  });
  const review = useMutation({
    mutationFn: () => verificationService.requestAddressReview(note),
    onSuccess: () => {
      setAskedReview(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.verification });
    },
  });
  const showReview = persist && (submit.isError || askedReview || reviewPending || failedUploads > 0);

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (address.trim().length >= 8) confirm.mutate();
      }}
    >
      <TextField
        label="Where you live now"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Street, area, city, state"
      />
      {ninHint && (
        <p className="text-[13px] text-ink-3">
          Last address on NIN/BVN: {ninHint}. Change the field if you have moved.
        </p>
      )}
      {confirm.isError && <p className="text-[13px] text-primary-text">{confirm.error.message}</p>}
      <Button
        type="submit"
        className="justify-self-start"
        disabled={askedReview || address.trim().length < 8 || confirm.isPending}
      >
        {confirm.isPending ? 'Sending…' : askedReview ? 'Sent for review' : 'Send for review'}
      </Button>
      {billName && (
        <p className="text-[13px] text-ink-2">Bill on file: {billName}</p>
      )}
      <button
        type="button"
        className="justify-self-start text-sm font-medium text-ink-2"
        onClick={() => setShowBill((open) => !open)}
      >
        {billToggleLabel(showBill, billName)}
      </button>
      {showBill && (
        <>
          <p className="text-[13px] text-ink-2">
            Utility bill or bank statement from the last 3 months, in your name.
          </p>
          <FileDrop value={file} onChange={setFile} />
          {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
          <Button
            type="button"
            className="justify-self-start"
            disabled={!file || submit.isPending}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? 'Uploading…' : persist ? 'Submit document' : 'Continue with this file'}
          </Button>
          {showReview && (
            <div className="grid gap-2">
              <label className="grid gap-1 text-[13px] text-ink-2">
                Note for staff (optional)
                <textarea
                  className="min-h-20 rounded-tile border border-surface-3 bg-surface px-3 py-2 text-sm text-ink"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. the bill is in my name with a spelling difference"
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                className="justify-self-start"
                disabled={review.isPending || askedReview}
                onClick={() => review.mutate()}
              >
                {askedReview ? 'Review requested' : review.isPending ? 'Requesting…' : 'Request a review'}
              </Button>
              {review.isError && <p className="text-[13px] text-primary-text">{review.error.message}</p>}
            </div>
          )}
        </>
      )}
      {onSkip && (
        <button type="button" className="justify-self-start text-sm font-medium text-ink-2" onClick={onSkip}>
          Skip for now — finish later in Account limits
        </button>
      )}
    </form>
  );
}
