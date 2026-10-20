import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, Chip, PageHeader, TextField } from '@/components/ui';
import { openFetchedBlob } from '@/lib/openBlob';

export function AdminKycQueuePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: rows } = useQuery({
    queryKey: queryKeys.staff.kycReviews,
    queryFn: staffService.kycReviews,
  });
  const [notes, setNotes] = useState('');
  const [target, setTarget] = useState<string | null>(null);

  const decide = useMutation({
    mutationFn: (approve: boolean) => staffService.decideKycReview(target!, { approve, notes }),
    onSuccess: () => {
      setNotes('');
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.kycReviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.summary });
    },
  });

  return (
    <>
      <PageHeader
        title="KYC reviews"
        subtitle="Auto Tier 3 only when the bill address matches NIMC exactly. Approve or reject everything else — moves, unreadable bills, and typed confirmations."
      />
      <div className="grid gap-3">
        {(rows ?? []).length === 0 && (
          <Card className="p-4 text-[13px] text-ink-2">No address reviews waiting.</Card>
        )}
        {(rows ?? []).map((row) => {
          const dojahBits = [
            row.dojah.resultStatus,
            row.dojah.statusReason,
            row.dojah.error,
            row.dojah.reason,
            row.dojah.extractedName ? `name: ${row.dojah.extractedName}` : null,
            row.dojah.extractedAddress ? `address: ${row.dojah.extractedAddress}` : null,
            row.dojah.isRecent === false ? 'not recent' : null,
          ].filter(Boolean);
          return (
            <Card key={row.applicantId} className="grid gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-[13px] text-ink-2">{row.email}</p>
                  {row.originalName && (
                    <p className="mt-1 text-[13px] text-ink-3">File: {row.originalName}</p>
                  )}
                  {row.hasFile ? (
                    <button
                      type="button"
                      className="mt-1 text-[13px] font-medium text-primary-text underline-offset-2 hover:underline"
                      onClick={() => {
                        void openFetchedBlob(() => staffService.kycReviewDocument(row.applicantId)).catch(
                          (error) => {
                            showToast(
                              error instanceof Error ? error.message : 'Could not open that file',
                              6000,
                            );
                          },
                        );
                      }}
                    >
                      View {row.originalName || 'uploaded document'}
                    </button>
                  ) : (
                    <p className="mt-1 text-[13px] text-ink-3">No file attached — customer confirmed an address in text.</p>
                  )}
                </div>
                <Chip tone="warning">Needs review</Chip>
              </div>
              {row.claimedAddress && (
                <p className="text-[13px] text-ink">Lives at: {row.claimedAddress}</p>
              )}
              {row.registryAddress && (
                <p className="text-[13px] text-ink-3">
                  Last on NIN/BVN (may be old): {row.registryAddress}
                </p>
              )}
              {row.note && <p className="text-[13px] text-ink">Customer note: {row.note}</p>}
              {dojahBits.length > 0 && (
                <p className="text-[13px] text-ink-3">Bill read: {dojahBits.join(' · ')}</p>
              )}
              {target === row.applicantId ? (
                <div className="grid gap-2">
                  <TextField
                    label="Staff notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={decide.isPending} onClick={() => decide.mutate(true)}>
                      Approve address
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate(false)}
                    >
                      Send back
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setTarget(null)}>
                      Cancel
                    </Button>
                  </div>
                  {decide.isError && <p className="text-[13px] text-primary-text">{decide.error.message}</p>}
                </div>
              ) : (
                <Button size="sm" className="justify-self-start" onClick={() => setTarget(row.applicantId)}>
                  Decide
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
