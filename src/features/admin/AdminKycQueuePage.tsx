import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import type { KycAddressReview } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, Chip, PageHeader, SelectField, TextField } from '@/components/ui';
import { openFetchedBlob } from '@/lib/openBlob';
import { StaffRecordList } from './StaffRecordList';
import { useStaffListParams } from './useStaffListParams';

const statusTone = {
  pending: 'warning',
  approved: 'success',
  returned: 'danger',
} as const;

const statusLabel = {
  pending: 'Waiting',
  approved: 'Approved',
  returned: 'Sent back',
} as const;

export function AdminKycQueuePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { page, pageSize, q, setQ, status, decidedBy, query, setListParams } = useStaffListParams({
    status: 'pending',
  });
  const { data } = useQuery({
    queryKey: queryKeys.staff.kycReviews(JSON.stringify(query)),
    queryFn: () => staffService.kycReviews(query),
  });
  const [notes, setNotes] = useState('');
  const [target, setTarget] = useState<string | null>(null);

  const decide = useMutation({
    mutationFn: (approve: boolean) => staffService.decideKycReview(target!, { approve, notes }),
    onSuccess: () => {
      setNotes('');
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: ['staff', 'kyc-reviews'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.summary });
    },
  });

  const rows = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="KYC reviews"
        subtitle="Waiting, approved, and sent-back address checks stay on this list. Approvals keep the staff name and email."
      />
      <StaffRecordList
        filters={
          <div className="grid gap-3 md:grid-cols-3">
            <TextField
              label="Search"
              placeholder="Name, email, or address"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <SelectField
              label="Status"
              value={status || 'pending'}
              onChange={(e) => setListParams({ status: e.target.value })}
              options={[
                { value: 'pending', label: 'Waiting' },
                { value: 'approved', label: 'Approved' },
                { value: 'returned', label: 'Sent back' },
                { value: 'all', label: 'All' },
              ]}
            />
            <TextField
              label="Approved by"
              placeholder="Staff email"
              value={decidedBy}
              onChange={(e) => setListParams({ decidedBy: e.target.value })}
            />
          </div>
        }
        page={page}
        pageSize={pageSize}
        total={data?.total ?? 0}
        empty="No address reviews match these filters."
        onPageChange={(next) => setListParams({ page: next }, false)}
      >
        {rows.map((row) => (
          <KycReviewCard
            key={row.applicantId}
            row={row}
            deciding={target === row.applicantId}
            notes={notes}
            error={decide.isError ? decide.error.message : undefined}
            pending={decide.isPending}
            onNotes={setNotes}
            onOpen={() => setTarget(row.applicantId)}
            onCancel={() => setTarget(null)}
            onDecide={(approve) => decide.mutate(approve)}
            onViewFile={() =>
              void openFetchedBlob(() => staffService.kycReviewDocument(row.applicantId)).catch((error) => {
                showToast(error instanceof Error ? error.message : 'Could not open that file', 6000);
              })
            }
          />
        ))}
      </StaffRecordList>
    </>
  );
}

function KycReviewCard({
  row,
  deciding,
  notes,
  error,
  pending,
  onNotes,
  onOpen,
  onCancel,
  onDecide,
  onViewFile,
}: {
  row: KycAddressReview;
  deciding: boolean;
  notes: string;
  error?: string;
  pending: boolean;
  onNotes: (value: string) => void;
  onOpen: () => void;
  onCancel: () => void;
  onDecide: (approve: boolean) => void;
  onViewFile: () => void;
}) {
  const rowStatus = row.status ?? 'pending';
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
    <Card className="grid gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-[13px] text-ink-2">{row.email}</p>
          {row.originalName && <p className="mt-1 text-[13px] text-ink-3">File: {row.originalName}</p>}
          {row.hasFile ? (
            <button
              type="button"
              className="mt-1 text-[13px] font-medium text-primary-text underline-offset-2 hover:underline"
              onClick={onViewFile}
            >
              View {row.originalName || 'uploaded document'}
            </button>
          ) : (
            <p className="mt-1 text-[13px] text-ink-3">No file attached — customer confirmed an address in text.</p>
          )}
        </div>
        <Chip tone={statusTone[rowStatus]}>{statusLabel[rowStatus]}</Chip>
      </div>
      {row.claimedAddress && <p className="text-[13px] text-ink">Lives at: {row.claimedAddress}</p>}
      {row.registryAddress && (
        <p className="text-[13px] text-ink-3">Last on NIN/BVN (may be old): {row.registryAddress}</p>
      )}
      {row.note && <p className="text-[13px] text-ink">Customer note: {row.note}</p>}
      {dojahBits.length > 0 && <p className="text-[13px] text-ink-3">Bill read: {dojahBits.join(' · ')}</p>}
      {(row.decidedByName || row.decidedByEmail) && (
        <p className="text-[13px] text-ink-2">
          {row.approved === false ? 'Sent back by' : 'Approved by'} {row.decidedByName || row.decidedByEmail}
          {row.decidedByEmail && row.decidedByName ? ` · ${row.decidedByEmail}` : ''}
        </p>
      )}
      {row.decisionNotes && <p className="text-[13px] text-ink-3">Staff notes: {row.decisionNotes}</p>}
      {rowStatus === 'pending' ? (
        deciding ? (
          <div className="grid gap-2">
            <TextField label="Staff notes" value={notes} onChange={(e) => onNotes(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={pending} onClick={() => onDecide(true)}>
                Approve address
              </Button>
              <Button size="sm" variant="secondary" disabled={pending} onClick={() => onDecide(false)}>
                Send back
              </Button>
              <Button size="sm" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            </div>
            {error && <p className="text-[13px] text-primary-text">{error}</p>}
          </div>
        ) : (
          <Button size="sm" className="justify-self-start" onClick={onOpen}>
            Decide
          </Button>
        )
      ) : null}
    </Card>
  );
}
