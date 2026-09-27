import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { IdentityLookup, SignUpResult } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { CodeStep } from './signup/CodeStep';
import { ConfirmStep } from './signup/ConfirmStep';
import { DoneStep } from './signup/DoneStep';
import { IdentityStep } from './signup/IdentityStep';
import { LoginDetailsStep } from './signup/LoginDetailsStep';
import { PhoneStep } from './signup/PhoneStep';

/**
 * PRD FR-01 onboarding: phone → SMS code → BVN/NIN → confirm details
 * (fetched from NIBSS) → login details → account number issued.
 */
type State =
  | { step: 'phone' }
  | { step: 'code'; phone: string }
  | { step: 'identity'; phone: string; token: string }
  | { step: 'confirm'; phone: string; token: string; identity: IdentityLookup }
  | { step: 'login-details'; token: string }
  | { step: 'done'; result: SignUpResult; credentials: { email: string; password: string } };

const TOTAL_STEPS = 5;

export function SignUpPage() {
  const [state, setState] = useState<State>({ step: 'phone' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const signIn = useMutation({
    mutationFn: (c: { email: string; password: string }) => login(c.email, c.password),
    onSuccess: () => navigate(paths.home, { replace: true }),
  });

  switch (state.step) {
    case 'phone':
      return (
        <AuthCard
          step={`Step 1 of ${TOTAL_STEPS}`}
          title="Open an account"
          subtitle="It takes about a minute. Start with your phone number."
        >
          <PhoneStep onDone={(phone) => setState({ step: 'code', phone })} />
        </AuthCard>
      );
    case 'code':
      return (
        <AuthCard
          step={`Step 2 of ${TOTAL_STEPS}`}
          title="Enter the code"
          subtitle={
            <>
              We sent a 6-digit code to <b className="font-medium text-ink">{state.phone}</b>.
            </>
          }
        >
          <CodeStep
            phone={state.phone}
            onDone={(token) => setState({ step: 'identity', phone: state.phone, token })}
            onChangeNumber={() => setState({ step: 'phone' })}
          />
        </AuthCard>
      );
    case 'identity':
      return (
        <AuthCard
          step={`Step 3 of ${TOTAL_STEPS}`}
          title="Verify your identity"
          subtitle="We’ll fetch your details from your BVN or NIN record."
        >
          <IdentityStep
            signUpToken={state.token}
            onDone={(identity) => setState({ ...state, step: 'confirm', identity })}
          />
        </AuthCard>
      );
    case 'confirm':
      return (
        <AuthCard
          step={`Step 4 of ${TOTAL_STEPS}`}
          title="Is this you?"
          subtitle="These details come from your identity record."
        >
          <ConfirmStep
            identity={state.identity}
            onConfirm={() => setState({ step: 'login-details', token: state.token })}
            onReject={() => setState({ step: 'identity', phone: state.phone, token: state.token })}
          />
        </AuthCard>
      );
    case 'login-details':
      return (
        <AuthCard
          step={`Step 5 of ${TOTAL_STEPS}`}
          title="Set up your login"
          subtitle="You’ll use these to log in on the web."
        >
          <LoginDetailsStep
            signUpToken={state.token}
            onDone={(result, credentials) => setState({ step: 'done', result, credentials })}
          />
        </AuthCard>
      );
    case 'done':
      return (
        <AuthCard title="Your account is ready" subtitle="Welcome to RoyalBlue.">
          <DoneStep
            result={state.result}
            onContinue={() => signIn.mutate(state.credentials)}
            isContinuing={signIn.isPending}
          />
        </AuthCard>
      );
  }
}
