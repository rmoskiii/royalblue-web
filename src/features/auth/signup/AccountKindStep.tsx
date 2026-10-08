import { useState } from 'react';
import type { AccountKind, EntityType } from '@/api/types';
import { Button } from '@/components/ui';
import { submitOnEnter, useEnterToSubmit } from '../lib/submitOnEnter';

const kindCard =
  'cursor-pointer rounded-[18px] border border-line bg-surface-2 px-4 py-4 text-left hover:border-brand has-[:checked]:border-brand';

export function AccountKindStep({
  onPick,
}: {
  onPick: (kind: AccountKind) => void;
}) {
  const [kind, setKind] = useState<AccountKind>('personal');
  const formRef = useEnterToSubmit();
  return (
    <form
      ref={formRef}
      className="grid gap-3"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        onPick(kind);
      }}
    >
      <label className={kindCard}>
        <input
          type="radio"
          name="account-kind"
          className="sr-only"
          checked={kind === 'personal'}
          onChange={() => setKind('personal')}
        />
        <p className="text-[15px] font-semibold text-brand">Personal</p>
        <p className="mt-1 text-sm text-ink-3">A naira account in your own name for everyday banking.</p>
      </label>
      <label className={kindCard}>
        <input
          type="radio"
          name="account-kind"
          className="sr-only"
          checked={kind === 'business'}
          onChange={() => setKind('business')}
        />
        <p className="text-[15px] font-semibold text-brand">Business</p>
        <p className="mt-1 text-sm text-ink-3">
          Individual trader, sole proprietor, limited company, NGO, or government agency.
        </p>
      </label>
      <Button type="submit" size="lg" block>
        Continue
      </Button>
    </form>
  );
}

export const BUSINESS_ENTITY_OPTIONS: Array<{
  value: EntityType;
  label: string;
  hint: string;
}> = [
  { value: 'INDIVIDUAL', label: 'Individual', hint: 'Unregistered trader. BVN and ID, no CAC.' },
  { value: 'SOLE_PROPRIETOR', label: 'Sole proprietor', hint: 'Business name (BN) on CAC.' },
  { value: 'LIMITED_ENTITY', label: 'Limited entity', hint: 'RC number, directors, CAC documents.' },
  { value: 'NGO', label: 'NGO', hint: 'Incorporated trustees, SCUML, trustees.' },
  { value: 'GOVERNMENT_AGENCY', label: 'Government agency', hint: 'Gazette, AG approval, permanent secretary.' },
];

export function EntityTypeStep({
  onPick,
}: {
  onPick: (type: EntityType) => void;
}) {
  const [entityType, setEntityType] = useState<EntityType>('INDIVIDUAL');
  const formRef = useEnterToSubmit();
  return (
    <form
      ref={formRef}
      className="grid gap-2"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        onPick(entityType);
      }}
    >
      {BUSINESS_ENTITY_OPTIONS.map((option) => (
        <label
          key={option.value}
          className="cursor-pointer rounded-[16px] border border-line px-4 py-3 text-left hover:border-brand has-[:checked]:border-brand"
        >
          <input
            type="radio"
            name="entity-type"
            className="sr-only"
            checked={entityType === option.value}
            onChange={() => setEntityType(option.value)}
          />
          <p className="text-sm font-semibold text-brand">{option.label}</p>
          <p className="mt-0.5 text-[13px] text-ink-3">{option.hint}</p>
        </label>
      ))}
      <Button type="submit" size="lg" block className="mt-1">
        Continue
      </Button>
    </form>
  );
}
