import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authService } from '@/api/services/auth';
import { useToast } from '@/app/providers/ToastProvider';
import { Button } from '@/components/ui';
import { demo } from '@/config/demo';
import { CodeInput } from '../components/CodeInput';

export function CodeStep({
  phone,
  onDone,
  onChangeNumber,
}: {
  phone: string;
  onDone: (signUpToken: string) => void;
  onChangeNumber: () => void;
}) {
  const { showToast } = useToast();
  const [code, setCode] = useState(demo?.signUp.code ?? '');
  const submit = useMutation({
    mutationFn: () => authService.verifyPhone(phone, code),
    onSuccess: ({ signUpToken }) => onDone(signUpToken),
  });
  const resend = useMutation({
    mutationFn: () => authService.startSignUp(phone),
    onSuccess: () => showToast('We’ve sent a new code'),
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 6) submit.mutate();
      }}
    >
      <CodeInput label="SMS code" value={code} onChange={setCode} />
      {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
      <Button type="submit" size="lg" block disabled={code.length !== 6 || submit.isPending}>
        {submit.isPending ? 'Checking…' : 'Verify'}
      </Button>
      <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
        <button
          type="button"
          className="font-medium text-primary-text hover:underline"
          onClick={() => resend.mutate()}
        >
          Resend code
        </button>
        <button
          type="button"
          className="font-medium text-brand hover:underline"
          onClick={onChangeNumber}
        >
          Change number
        </button>
      </p>
    </form>
  );
}
