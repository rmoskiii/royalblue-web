import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { TextField, type TextFieldProps } from '@/components/ui';

export function PasswordField(props: Omit<TextFieldProps, 'type' | 'suffix'>) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="grid size-9 place-items-center rounded-lg text-ink-3 hover:text-ink"
        >
          {visible ? <Eye className="size-4.5" /> : <EyeOff className="size-4.5" />}
        </button>
      }
    />
  );
}
