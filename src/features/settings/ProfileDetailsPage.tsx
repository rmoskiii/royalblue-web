import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys, useCustomerProfile } from '@/api/hooks';
import { profileService } from '@/api/services/profiles';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, PageHeader, SelectField, TextField } from '@/components/ui';
import { nigeriaStates } from './nigeriaStates';
import { SettingsBack } from './SettingsBack';

export function ProfileDetailsPage() {
  const queryClient = useQueryClient();
  const { data } = useCustomerProfile();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    residentialAddress: '',
    city: '',
    state: '',
    employerName: '',
    jobTitle: '',
    monthlyNetIncome: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    if (!data) return;
    const p = data.individual;
    setForm({
      phone: data.user.phone ?? '',
      firstName: p?.firstName ?? data.user.firstName ?? '',
      lastName: p?.lastName ?? data.user.lastName ?? '',
      dateOfBirth: p?.dateOfBirth ?? '',
      gender: p?.gender ?? '',
      maritalStatus: p?.maritalStatus ?? '',
      residentialAddress: p?.residentialAddress ?? '',
      city: p?.city ?? '',
      state: p?.state ?? '',
      employerName: p?.employerName ?? '',
      jobTitle: p?.jobTitle ?? '',
      monthlyNetIncome: p?.monthlyNetIncome != null ? String(p.monthlyNetIncome) : '',
      nextOfKinName: p?.nextOfKinName ?? '',
      nextOfKinPhone: p?.nextOfKinPhone ?? '',
      nextOfKinRelationship: p?.nextOfKinRelationship ?? '',
      bankName: p?.bankName ?? '',
      accountNumber: p?.accountNumber ?? '',
      accountName: p?.accountName ?? '',
    });
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      profileService.update({
        phone: form.phone || undefined,
        individual: {
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          maritalStatus: form.maritalStatus || undefined,
          residentialAddress: form.residentialAddress || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          employerName: form.employerName || undefined,
          jobTitle: form.jobTitle || undefined,
          monthlyNetIncome: form.monthlyNetIncome ? Number(form.monthlyNetIncome) : undefined,
          nextOfKinName: form.nextOfKinName || undefined,
          nextOfKinPhone: form.nextOfKinPhone || undefined,
          nextOfKinRelationship: form.nextOfKinRelationship || undefined,
          bankName: form.bankName || undefined,
          accountNumber: form.accountNumber || undefined,
          accountName: form.accountName || undefined,
        },
      }),
    onSuccess: (row) => {
      queryClient.setQueryData(queryKeys.customerProfile, row);
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      showToast('Profile saved');
    },
    onError: (error: Error) => showToast(error.message),
  });

  if (!data) return null;
  const locked = data.editable;
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <SettingsBack />
      <PageHeader title="Personal details" subtitle="What we show on your account and loan files." />
      <form
        className="mx-auto grid max-w-xl gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Card className="grid gap-3">
          <h2 className="font-semibold">Identity</h2>
          <TextField label="Email" value={data.user.email} disabled hint="Email cannot be changed here." />
          <TextField label="Phone" value={form.phone} onChange={set('phone')} disabled={!locked.phone} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="First name" value={form.firstName} onChange={set('firstName')} disabled={!locked.firstName} />
            <TextField label="Last name" value={form.lastName} onChange={set('lastName')} disabled={!locked.lastName} />
          </div>
          <TextField
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={set('dateOfBirth')}
            disabled={!locked.dateOfBirth}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Gender"
              value={form.gender}
              onChange={set('gender')}
              options={[
                { value: '', label: 'Select' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Prefer not to say' },
              ]}
            />
            <SelectField
              label="Marital status"
              value={form.maritalStatus}
              onChange={set('maritalStatus')}
              options={[
                { value: '', label: 'Select' },
                { value: 'Single', label: 'Single' },
                { value: 'Married', label: 'Married' },
                { value: 'Divorced', label: 'Divorced' },
                { value: 'Widowed', label: 'Widowed' },
              ]}
            />
          </div>
          <p className="text-[13px] text-ink-3">
            BVN {data.applicant?.bvn ?? 'not linked'} · NIN {data.applicant?.nin ?? 'not linked'}
          </p>
        </Card>

        <Card className="grid gap-3">
          <h2 className="font-semibold">Home address</h2>
          <TextField
            label="Street address"
            value={form.residentialAddress}
            onChange={set('residentialAddress')}
            disabled={!locked.address}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="City" value={form.city} onChange={set('city')} disabled={!locked.address} />
            <SelectField
              label="State"
              value={form.state}
              onChange={set('state')}
              disabled={!locked.address}
              options={[{ value: '', label: 'Select state' }, ...nigeriaStates.map((s) => ({ value: s, label: s }))]}
            />
          </div>
        </Card>

        <Card className="grid gap-3">
          <h2 className="font-semibold">Work</h2>
          <TextField
            label="Employer"
            value={form.employerName}
            onChange={set('employerName')}
            disabled={!locked.employment}
          />
          <TextField label="Job title" value={form.jobTitle} onChange={set('jobTitle')} disabled={!locked.employment} />
          <TextField
            label="Monthly net income (₦)"
            inputMode="numeric"
            value={form.monthlyNetIncome}
            onChange={set('monthlyNetIncome')}
            disabled={!locked.employment}
          />
        </Card>

        <Card className="grid gap-3">
          <h2 className="font-semibold">Next of kin</h2>
          <TextField label="Full name" value={form.nextOfKinName} onChange={set('nextOfKinName')} />
          <TextField label="Phone" value={form.nextOfKinPhone} onChange={set('nextOfKinPhone')} />
          <SelectField
            label="Relationship"
            value={form.nextOfKinRelationship}
            onChange={set('nextOfKinRelationship')}
            options={[
              { value: '', label: 'Select' },
              { value: 'Spouse', label: 'Spouse' },
              { value: 'Parent', label: 'Parent' },
              { value: 'Sibling', label: 'Sibling' },
              { value: 'Child', label: 'Child' },
              { value: 'Friend', label: 'Friend' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </Card>

        <Card className="grid gap-3">
          <h2 className="font-semibold">Salary account</h2>
          <TextField
            label="Bank"
            value={form.bankName}
            onChange={set('bankName')}
            disabled={!locked.salaryAccount}
          />
          <TextField
            label="Account number"
            value={form.accountNumber}
            onChange={set('accountNumber')}
            disabled={!locked.salaryAccount}
          />
          <TextField
            label="Account name"
            value={form.accountName}
            onChange={set('accountName')}
            disabled={!locked.salaryAccount}
          />
        </Card>

        <Button type="submit" size="lg" block disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save details'}
        </Button>
      </form>
    </>
  );
}
