import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import type { ApplicationStatus } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, Chip, PageHeader, SelectField, TextField } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { openFetchedBlob } from '@/lib/openBlob';
import { applicantName, canDecide, canRecommend, statusTone } from './staffAccess';

export function AdminCreditFilePage() {
  const { id = '' } = useParams();
  const { session } = useAuth();
  const { showToast } = useToast();
  const role = session?.user.role;
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: queryKeys.staff.application(id),
    queryFn: () => staffService.creditFile(id),
    enabled: Boolean(id),
  });
  const { data: team } = useQuery({
    queryKey: queryKeys.staff.team,
    queryFn: staffService.team,
    enabled: canRecommend(role),
  });

  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [tenor, setTenor] = useState('');
  const [ratePA, setRatePA] = useState('');
  const [equityPercent, setEquityPercent] = useState('');
  const [income, setIncome] = useState('');
  const [debt, setDebt] = useState('');
  const [risk, setRisk] = useState('MEDIUM');

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.application(id) });
    queryClient.invalidateQueries({ queryKey: ['staff', 'applications'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.summary });
  };

  const claim = useMutation({
    mutationFn: () => staffService.assign(id, session!.user.id),
    onSuccess: refresh,
  });
  const recommend = useMutation({
    mutationFn: () => {
      const monthlyNetIncome = Number(income) || 0;
      const totalMonthlyDebt = Number(debt) || 0;
      return staffService.recommend(id, {
        monthlyNetIncome,
        totalMonthlyDebt,
        dsrRatio: monthlyNetIncome > 0 ? totalMonthlyDebt / monthlyNetIncome : 0,
        riskRating: risk,
        recommendedAmount: Number(amount) || Number(data?.requestedAmount ?? 0),
        recommendationType: 'APPROVE',
        officerNotes: notes || 'Recommended for credit review',
      });
    },
    onSuccess: refresh,
  });
  const decide = useMutation({
    mutationFn: (decision: ApplicationStatus) =>
      staffService.decide(id, {
        decision,
        finalAmount: amount ? Number(amount) : undefined,
        finalTenor: tenor ? Number(tenor) : undefined,
        finalInterestRatePA: ratePA ? Number(ratePA) : undefined,
        finalEquityPercent: equityPercent === '' ? undefined : Number(equityPercent),
        decisionNotes: notes || decision,
      }),
    onSuccess: refresh,
  });
  const disburse = useMutation({
    mutationFn: () => staffService.disburse(id),
    onSuccess: refresh,
  });

  if (!data) return null;
  const name = applicantName(data);
  const latestAssessment = data.assessments?.[0];
  const openForRecommend = canRecommend(role) && !['APPROVED', 'APPROVED_WITH_CONDITIONS', 'DECLINED', 'DISBURSED', 'ACTIVE'].includes(data.status);
  const openForDecide = canDecide(role) && data.status === 'CREDIT_REVIEW';
  const openForDisburse =
    canDecide(role) && (data.status === 'APPROVED' || data.status === 'APPROVED_WITH_CONDITIONS');

  return (
    <>
      <PageHeader
        title={data.applicationNumber}
        subtitle={name}
        action={<Chip tone={statusTone(data.status)}>{data.status.replaceAll('_', ' ')}</Chip>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="grid gap-2 p-4 text-sm">
          <h2 className="font-semibold">Facility</h2>
          <p>{data.loanProduct?.name}</p>
          <p>
            Requested {formatNaira(Number(data.requestedAmount))} · {data.tenorMonths} months
            {data.offeredInterestRatePA != null
              ? ` · offered ${Number(data.offeredInterestRatePA)}% p.a.`
              : ''}
            {data.offeredEquityPercent != null ? ` · ${Number(data.offeredEquityPercent)}% equity` : ''}
          </p>
          <p>Purpose: {data.purpose}</p>
          {data.applicant?.ippisNumber && <p>IPPIS {data.applicant.ippisNumber}</p>}
          {data.approvedAmount != null && (
            <p>
              Approved {formatNaira(Number(data.approvedAmount))} · {data.approvedTenorMonths ?? data.tenorMonths}{' '}
              months
              {data.monthlyRate != null
                ? ` · ${(Number(data.monthlyRate) * 100 * 12).toFixed(2)}% p.a.`
                : ''}
              {data.approvedEquityPercent != null
                ? ` · ${Number(data.approvedEquityPercent)}% equity`
                : ''}
            </p>
          )}
          {data.disbursementReference && <p>Disbursed to RoyalBlue · {data.disbursementReference}</p>}
          {data.payrollMandateRef && <p>Payroll mandate {data.payrollMandateRef}</p>}
          {data.bureauProvider && <p>Bureau {data.bureauProvider}</p>}
          <p className="text-ink-2">Officer {data.assignedOfficer?.email ?? 'unassigned'}</p>
          {canRecommend(role) && session?.user.id && data.assignedOfficer?.id !== session.user.id && (
            <Button size="sm" variant="secondary" disabled={claim.isPending} onClick={() => claim.mutate()}>
              Claim this file
            </Button>
          )}
        </Card>
        <Card className="grid gap-2 p-4 text-sm">
          <h2 className="font-semibold">Next of kin / salary</h2>
          <p>
            {data.nextOfKinName} · {data.nextOfKinPhone} · {data.nextOfKinRelationship}
          </p>
          <p>
            {data.salaryBankName} {data.salaryAccountNumber}
          </p>
          <p>{data.applicant?.individual?.employerName}</p>
        </Card>
        <Card className="grid gap-2 p-4 text-sm">
          <h2 className="font-semibold">Guarantors</h2>
          {(data.guarantors ?? []).map((g) => (
            <div key={g.id}>
              <p className="font-medium">{g.fullName}</p>
              <p>
                {g.employer} · {g.phone} · {g.email}
              </p>
              <p>
                {g.relationship} · income {formatNaira(Number(g.income))}
              </p>
            </div>
          ))}
          {(data.guarantors ?? []).length === 0 && <p className="text-ink-3">No guarantors on file.</p>}
        </Card>
        <Card className="grid gap-2 p-4 text-sm">
          <h2 className="font-semibold">Documents</h2>
          {(data.documents ?? []).map((doc) => (
            <button
              key={doc.id}
              type="button"
              className="text-left text-primary-text underline-offset-2 hover:underline"
              onClick={() => {
                void openFetchedBlob(() => staffService.documentBlob(data.id, doc.id)).catch((error) => {
                  showToast(error instanceof Error ? error.message : 'Could not open that file', 6000);
                });
              }}
            >
              View {doc.originalName || doc.documentType}
            </button>
          ))}
          {(data.documents ?? []).length === 0 && <p className="text-ink-3">No files uploaded.</p>}
        </Card>
        {latestAssessment && (
          <Card className="grid gap-2 p-4 text-sm lg:col-span-2">
            <h2 className="font-semibold">Officer recommendation</h2>
            <p>
              {formatNaira(Number(latestAssessment.recommendedAmount))} · {latestAssessment.riskRating} · DSR{' '}
              {(Number(latestAssessment.dsrRatio) * 100).toFixed(0)}%
            </p>
            <p>{latestAssessment.officerNotes}</p>
          </Card>
        )}
        {openForRecommend && (
          <Card className="grid gap-3 p-4 text-sm lg:col-span-2">
            <h2 className="font-semibold">Recommend to credit</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Monthly net income (₦)"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
              <TextField label="Total monthly debt (₦)" value={debt} onChange={(e) => setDebt(e.target.value)} />
              <TextField
                label="Recommended amount (₦)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(data.requestedAmount)}
              />
              <SelectField
                label="Risk"
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]}
              />
            </div>
            <TextField label="Officer notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            {recommend.isError && <p className="text-primary-text">{recommend.error.message}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => recommend.mutate()} disabled={recommend.isPending}>
                Send to credit manager
              </Button>
            </div>
            {team && role === 'ADMINISTRATOR' && (
              <p className="text-xs text-ink-3">{team.length} staff on the desk.</p>
            )}
          </Card>
        )}
        {openForDecide && (
          <Card className="grid gap-3 p-4 text-sm lg:col-span-2">
            <h2 className="font-semibold">Decision</h2>
            <p className="text-ink-2">
              Leave a field blank to accept the customer’s offer. You can still change amount, tenor, rate, or equity.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <TextField
                label="Approved amount (₦)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(data.requestedAmount)}
              />
              <TextField
                label="Approved tenor (months)"
                type="number"
                min={1}
                max={12}
                value={tenor}
                onChange={(e) => setTenor(e.target.value)}
                placeholder={String(data.tenorMonths)}
              />
              <TextField
                label="Approved rate (% p.a.)"
                type="number"
                min={0}
                max={60}
                step={0.5}
                value={ratePA}
                onChange={(e) => setRatePA(e.target.value)}
                placeholder={
                  data.offeredInterestRatePA != null ? String(Number(data.offeredInterestRatePA)) : undefined
                }
              />
              <TextField
                label="Approved equity (%)"
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={equityPercent}
                onChange={(e) => setEquityPercent(e.target.value)}
                placeholder={
                  data.offeredEquityPercent != null ? String(Number(data.offeredEquityPercent)) : '20'
                }
              />
            </div>
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            {decide.isError && <p className="text-primary-text">{decide.error.message}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => decide.mutate('APPROVED')} disabled={decide.isPending}>
                Approve
              </Button>
              <Button variant="secondary" onClick={() => decide.mutate('DECLINED')} disabled={decide.isPending}>
                Decline
              </Button>
            </div>
          </Card>
        )}
        {openForDisburse && (
          <Card className="grid gap-3 p-4 text-sm lg:col-span-2">
            <h2 className="font-semibold">Disburse to RoyalBlue account</h2>
            <p>
              Credits {formatNaira(Number(data.approvedAmount ?? data.requestedAmount))} to the customer’s
              passbook. They must already hold{' '}
              {Number(data.approvedEquityPercent ?? data.offeredEquityPercent ?? 20)}% equity in that account.
            </p>
            {disburse.isError && <p className="text-primary-text">{disburse.error.message}</p>}
            <Button onClick={() => disburse.mutate()} disabled={disburse.isPending}>
              Disburse funds
            </Button>
          </Card>
        )}
        {canRecommend(role) && !canDecide(role) && data.status === 'CREDIT_REVIEW' && (
          <Card className="p-4 text-sm text-ink-2 lg:col-span-2">
            This file is with the credit manager. You can still open documents, but you cannot approve it.
          </Card>
        )}
      </div>
    </>
  );
}
