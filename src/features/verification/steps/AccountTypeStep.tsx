import { Briefcase, User, type LucideIcon } from 'lucide-react';
import type { AccountType } from '@/api/types';
import { StepHeading } from '../StepHeading';
import type { StepProps } from '../types';

const options: { value: AccountType; title: string; body: string; icon: LucideIcon }[] = [
  {
    value: 'personal',
    title: 'Personal',
    body: 'For salaries, savings and everyday spending.',
    icon: User,
  },
  {
    value: 'business',
    title: 'Business',
    body: 'For registered businesses. You’ll need your CAC number.',
    icon: Briefcase,
  },
];

export function AccountTypeStep({ form, update }: StepProps) {
  return (
    <>
      <StepHeading title="Account type" lead="Choose the kind of account you want to open." />
      <div className="grid gap-2.5" role="radiogroup" aria-label="Account type">
        {options.map(({ value, title, body, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={form.accountType === value}
            onClick={() => update({ accountType: value })}
            className="flex items-start gap-3 rounded-tile border border-line bg-surface p-3.5 text-left aria-checked:border-primary aria-checked:bg-primary-soft"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-primary-text">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="text-[13px] text-ink-2">{body}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
