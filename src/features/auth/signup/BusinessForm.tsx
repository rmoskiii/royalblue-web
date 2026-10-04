import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { authService } from '@/api/services/auth';
import type { EntityType } from '@/api/types';
import { Button, TextField } from '@/components/ui';
import { submitOnEnter } from '../lib/submitOnEnter';

export const CAC_LOOKUP_TYPE: Partial<Record<EntityType, string>> = {
  SOLE_PROPRIETOR: 'Business Name',
  LIMITED_ENTITY: 'Limited Entity',
  NGO: 'Incorporated Trustees',
  GOVERNMENT_AGENCY: 'Other',
};

export function BusinessForm({
  entityType,
  onDone,
}: {
  entityType: EntityType;
  onDone: (business: {
    registeredName: string;
    tradeName?: string;
    registrationNumber?: string;
    description?: string;
  }) => void;
}) {
  const needsCac = entityType !== 'INDIVIDUAL';
  const [registeredName, setRegisteredName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');

  const lookup = useMutation({
    mutationFn: () =>
      authService.lookupCac(registrationNumber.trim(), CAC_LOOKUP_TYPE[entityType]),
    onSuccess: (result) => {
      if (result.registeredName) setRegisteredName(result.registeredName);
      if (result.tradeName) setTradeName(result.tradeName);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onDone({
      registeredName: registeredName.trim(),
      tradeName: tradeName.trim() || undefined,
      registrationNumber: needsCac ? registrationNumber.trim() : 'UNREGISTERED',
      description: description.trim() || undefined,
    });
  };

  return (
    <form className="grid gap-4" onKeyDown={submitOnEnter} onSubmit={handleSubmit}>
      {needsCac && (
        <div className="grid gap-2">
          <TextField
            label={entityType === 'SOLE_PROPRIETOR' ? 'BN number' : 'Registration number'}
            required
            autoFocus
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
          <button
            type="button"
            className="justify-self-start text-sm font-medium text-brand"
            disabled={registrationNumber.trim().length < 3 || lookup.isPending}
            onClick={() => lookup.mutate()}
          >
            {lookup.isPending ? 'Looking up CAC…' : 'Look up on CAC'}
          </button>
          {lookup.isError && <p className="text-[13px] text-primary-text">{lookup.error.message}</p>}
          {lookup.isSuccess && lookup.data.sandbox && (
            <p className="text-[13px] text-ink-3">Sandbox CAC match — live lookup is not enabled on this key.</p>
          )}
        </div>
      )}
      <TextField
        label="Registered / business name"
        required
        autoFocus={!needsCac}
        value={registeredName}
        onChange={(e) => setRegisteredName(e.target.value)}
      />
      <TextField
        label="Trade name"
        value={tradeName}
        onChange={(e) => setTradeName(e.target.value)}
      />
      <TextField
        label="What does the business do?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        type="submit"
        size="lg"
        block
        disabled={!registeredName.trim() || (needsCac && !registrationNumber.trim())}
      >
        Open account
      </Button>
    </form>
  );
}
