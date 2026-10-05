import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { queryKeys } from '@/api/hooks';
import { businessService } from '@/api/services/business';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Modal, TextField } from '@/components/ui';

/** PRD View 2 staff access control: add a cashier with read-only access to credit alerts. */
export function AddStaffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const reset = () => {
    setName('');
    setPhone('');
    setEmail('');
  };

  const add = useMutation({
    mutationFn: () =>
      businessService.addStaff({ name: name.trim(), email: email.trim(), phone: `+234${phone}` }),
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.staff });
      showToast(`Invite sent to ${member.name}`);
      reset();
      onClose();
    },
  });

  const valid = name.trim().length > 1 && /^\d{10}$/.test(phone) && /\S+@\S+\.\S+/.test(email);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) add.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a cashier">
      <form className="grid gap-4 px-4 pt-2 pb-4" onSubmit={submit}>
        <p className="flex gap-2.5 rounded-xl bg-surface-2 p-3 text-[13px] text-ink-2">
          <Info className="size-4 shrink-0 text-brand" />
          Cashiers only see incoming payment alerts. They can’t send money, see your balance or
          change settings.
        </p>
        <TextField
          label="Full name"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Phone number"
          type="tel"
          inputMode="numeric"
          prefix="+234"
          maxLength={10}
          placeholder="8034564521"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/^0/, ''))}
          inputClassName="pl-15 tabular"
        />
        <TextField
          label="Email"
          type="email"
          placeholder="cashier@business.com"
          hint="We’ll email them a link to set up their login."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {add.isError && <p className="text-[13px] text-primary-text">{add.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!valid || add.isPending}>
          {add.isPending ? 'Sending invite…' : 'Send invite'}
        </Button>
      </form>
    </Modal>
  );
}
