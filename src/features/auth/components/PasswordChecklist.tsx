import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { passwordRules } from '../lib/passwordRules';

export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="grid grid-cols-2 gap-1.5 text-[13px]">
      {passwordRules.map((rule) => {
        const ok = rule.test(value);
        return (
          <li key={rule.label} className={cn('flex items-center gap-1.5', ok ? 'text-success' : 'text-ink-3')}>
            <Check className="size-3.5 shrink-0" />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
