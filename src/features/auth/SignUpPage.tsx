import { useMutation } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import type { AccountKind, EntityType, IdentityLookup } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { demo } from '@/config/demo';
import { CodeInput } from './components/CodeInput';
import { PasswordField } from './components/PasswordField';
import { submitOnEnter } from './lib/submitOnEnter';
import { PinStep } from './signup/PinStep';
import { TotpStep } from './signup/TotpStep';
import { AccountKindStep, EntityTypeStep } from './signup/AccountKindStep';
import { PersonDetailsStep } from './signup/BusinessDetailsStep';
import { BusinessForm } from './signup/BusinessForm';
import { ConfirmStep } from './signup/ConfirmStep';
import { IdentityStep } from './signup/IdentityStep';

type Draft = {
  email: string;
  otp: string;
  password: string;
  kind: AccountKind;
  entityType: EntityType;
  firstName: string;
  lastName: string;
  phone: string;
  bvn?: string;
  nin?: string;
  pin: string;
  totpCode: string;
};

type State =
  | { step: 'email' }
  | { step: 'otp'; email: string; otpHint?: string }
  | { step: 'password'; email: string; otp: string }
  | { step: 'totp'; email: string; otp: string; password: string }
  | { step: 'kind'; email: string; otp: string; password: string; totpCode: string }
  | { step: 'entity'; email: string; otp: string; password: string; totpCode: string }
  | { step: 'person'; email: string; otp: string; password: string; totpCode: string; kind: AccountKind; entityType: EntityType }
  | {
      step: 'identity';
      email: string;
      otp: string;
      password: string;
      totpCode: string;
      kind: AccountKind;
      entityType: EntityType;
      firstName: string;
      lastName: string;
      phone: string;
    }
  | {
      step: 'confirm';
      email: string;
      otp: string;
      password: string;
      totpCode: string;
      kind: AccountKind;
      entityType: EntityType;
      firstName: string;
      lastName: string;
      phone: string;
      identity: IdentityLookup;
      bvn?: string;
      nin?: string;
    }
  | {
      step: 'business';
      email: string;
      otp: string;
      password: string;
      totpCode: string;
      kind: AccountKind;
      entityType: EntityType;
      firstName: string;
      lastName: string;
      phone: string;
      bvn?: string;
      nin?: string;
    }
  | {
      step: 'pin';
      email: string;
      otp: string;
      password: string;
      totpCode: string;
      kind: AccountKind;
      entityType: EntityType;
      firstName: string;
      lastName: string;
      phone: string;
      bvn?: string;
      nin?: string;
      identity?: IdentityLookup;
      business?: {
        registeredName: string;
        tradeName?: string;
        registrationNumber?: string;
        description?: string;
      };
    };

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1 rounded-[10px] bg-surface-2 px-2 text-sm text-ink-2"
    >
      <ChevronLeft className="size-4" />
      Back
    </button>
  );
}

export function SignUpPage() {
  const [state, setState] = useState<State>({ step: 'email' });
  const [email, setEmail] = useState(demo?.signUp.email ?? '');
  const { establishSession } = useAuth();
  const navigate = useNavigate();

  const finish = useMutation({
    mutationFn: async (
      payload: Draft & {
        business?: {
          registeredName: string;
          tradeName?: string;
          registrationNumber?: string;
          description?: string;
        };
      },
    ) => {
      const session = await authService.completeSignUp({
        signUpToken: payload.otp,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        firstName: payload.firstName,
        lastName: payload.lastName,
        bvn: payload.bvn,
        nin: payload.nin,
        pin: payload.pin,
        totpCode: payload.totpCode,
        accountKind: payload.kind,
        entityType: payload.entityType,
        business: payload.business,
      });
      establishSession(session);
    },
    onSuccess: () => navigate(paths.home, { replace: true }),
  });

  if (state.step === 'email') {
    return (
      <EmailStep
        email={email}
        onEmail={setEmail}
        onDone={(next) => {
          if (!next.mfaRequired) {
            setState({
              step: 'password',
              email: next.email,
              otp: next.otpHint ?? '000000',
            });
            return;
          }
          setState({ step: 'otp', email: next.email, otpHint: next.otpHint });
        }}
      />
    );
  }

  if (state.step === 'otp') {
    return (
      <VerifyEmailStep
        email={state.email}
        otpHint={state.otpHint}
        onBack={() => setState({ step: 'email' })}
        onDone={(otp) => setState({ step: 'password', email: state.email, otp })}
      />
    );
  }

  if (state.step === 'password') {
    return (
      <PasswordStep
        onBack={() => setState({ step: 'email' })}
        onDone={(password) =>
          setState({
            step: 'kind',
            email: state.email,
            otp: state.otp,
            password,
            totpCode: '',
          })
        }
      />
    );
  }

  if (state.step === 'totp') {
    return (
      <AuthCard
        title="Google Authenticator"
        subtitle="Add RoyalBlue to your authenticator app, then enter the 6-digit code."
        back={
          <BackButton
            onClick={() =>
              setState({
                step: 'password',
                email: state.email,
                otp: state.otp,
              })
            }
          />
        }
      >
        <TotpStep
          email={state.email}
          otp={state.otp}
          onDone={(totpCode) =>
            setState({
              step: 'kind',
              email: state.email,
              otp: state.otp,
              password: state.password,
              totpCode,
            })
          }
        />
      </AuthCard>
    );
  }

  if (state.step === 'kind') {
    return (
      <AuthCard
        title="Account type"
        subtitle="Personal banking, or a BudPay business KYC profile."
        back={
          <BackButton
            onClick={() =>
              setState({
                step: 'password',
                email: state.email,
                otp: state.otp,
              })
            }
          />
        }
      >
        <AccountKindStep
          onPick={(kind) =>
            kind === 'personal'
              ? setState({
                  step: 'person',
                  email: state.email,
                  otp: state.otp,
                  password: state.password,
                  totpCode: state.totpCode,
                  kind,
                  entityType: 'INDIVIDUAL',
                })
              : setState({
                  step: 'entity',
                  email: state.email,
                  otp: state.otp,
                  password: state.password,
                  totpCode: state.totpCode,
                })
          }
        />
      </AuthCard>
    );
  }

  if (state.step === 'entity') {
    return (
      <AuthCard
        title="Business type"
        subtitle="This maps to BudPay KYC v2 (individual, sole, limited, NGO, government)."
        back={
          <BackButton
            onClick={() =>
              setState({
                step: 'kind',
                email: state.email,
                otp: state.otp,
                password: state.password,
                totpCode: state.totpCode,
              })
            }
          />
        }
      >
        <EntityTypeStep
          onPick={(entityType) =>
            setState({
              step: 'person',
              email: state.email,
              otp: state.otp,
              password: state.password,
              totpCode: state.totpCode,
              kind: 'business',
              entityType,
            })
          }
        />
      </AuthCard>
    );
  }

  if (state.step === 'person') {
    return (
      <AuthCard
        title="Your details"
        subtitle="We’ll match this to BVN when you verify identity."
        back={
          <BackButton
            onClick={() =>
              state.kind === 'business'
                ? setState({
                    step: 'entity',
                    email: state.email,
                    otp: state.otp,
                    password: state.password,
                  totpCode: state.totpCode,
                  })
                : setState({
                    step: 'kind',
                    email: state.email,
                    otp: state.otp,
                    password: state.password,
                  totpCode: state.totpCode,
                  })
            }
          />
        }
      >
        <PersonDetailsStep
          onDone={(person) =>
            setState({
              ...state,
              ...person,
              step: 'identity',
            })
          }
        />
      </AuthCard>
    );
  }

  if (state.step === 'identity') {
    return (
      <AuthCard
        title="Identity verification"
        subtitle="We confirm your name with BudPay KYC. You can continue if the lookup is slow."
        back={
          <BackButton
            onClick={() =>
              setState({
                step: 'person',
                email: state.email,
                otp: state.otp,
                password: state.password,
                totpCode: state.totpCode,
                kind: state.kind,
                entityType: state.entityType,
              })
            }
          />
        }
      >
        <IdentityStep
          firstName={state.firstName}
          lastName={state.lastName}
          phone={state.phone}
          onDone={(identity, submitted) =>
            setState({
              ...state,
              step: 'confirm',
              identity,
              bvn: submitted.type === 'bvn' ? submitted.number : undefined,
              nin: submitted.type === 'nin' ? submitted.number : undefined,
            })
          }
        />
      </AuthCard>
    );
  }

  if (state.step === 'confirm') {
    return (
      <AuthCard
        title="Is this you?"
        back={
          <BackButton
            onClick={() =>
              setState({
                step: 'identity',
                email: state.email,
                otp: state.otp,
                password: state.password,
                totpCode: state.totpCode,
                kind: state.kind,
                entityType: state.entityType,
                firstName: state.firstName,
                lastName: state.lastName,
                phone: state.phone,
              })
            }
          />
        }
      >
        <ConfirmStep
          identity={state.identity}
          onConfirm={() =>
            state.kind === 'business'
              ? setState({
                  step: 'business',
                  email: state.email,
                  otp: state.otp,
                  password: state.password,
                  totpCode: state.totpCode,
                  kind: state.kind,
                  entityType: state.entityType,
                  firstName: state.identity.firstName || state.firstName,
                  lastName: state.identity.lastName || state.lastName,
                  phone: state.phone,
                  bvn: state.bvn,
                  nin: state.nin,
                })
              : setState({
                  step: 'pin',
                  email: state.email,
                  otp: state.otp,
                  password: state.password,
                  totpCode: state.totpCode,
                  kind: 'personal',
                  entityType: 'INDIVIDUAL',
                  firstName: state.identity.firstName || state.firstName,
                  lastName: state.identity.lastName || state.lastName,
                  phone: state.phone,
                  bvn: state.bvn,
                  nin: state.nin,
                  identity: state.identity,
                })
          }
          onReject={() =>
            setState({
              step: 'identity',
              email: state.email,
              otp: state.otp,
              password: state.password,
              totpCode: state.totpCode,
              kind: state.kind,
              entityType: state.entityType,
              firstName: state.firstName,
              lastName: state.lastName,
              phone: state.phone,
            })
          }
        />
      </AuthCard>
    );
  }

  if (state.step === 'business') {
    return (
    <AuthCard
      title="Business information"
      subtitle="We’ll look this up on CAC where the entity type requires it."
      back={
        <BackButton
          onClick={() =>
            setState({
              step: 'identity',
              email: state.email,
              otp: state.otp,
              password: state.password,
              totpCode: state.totpCode,
              kind: state.kind,
              entityType: state.entityType,
              firstName: state.firstName,
              lastName: state.lastName,
              phone: state.phone,
            })
          }
        />
      }
    >
      <BusinessForm
        entityType={state.entityType}
        onDone={(business) =>
          setState({
            step: 'pin',
            email: state.email,
            otp: state.otp,
            password: state.password,
            totpCode: state.totpCode,
            kind: 'business',
            entityType: state.entityType,
            firstName: state.firstName,
            lastName: state.lastName,
            phone: state.phone,
            bvn: state.bvn,
            nin: state.nin,
            business,
          })
        }
      />
    </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Transaction PIN"
      subtitle="You’ll enter this 6-digit PIN to send money, pay bills, or make a payout. Not your login password."
      back={
        <BackButton
          onClick={() =>
            state.kind === 'business'
              ? setState({
                  step: 'business',
                  email: state.email,
                  otp: state.otp,
                  password: state.password,
                  totpCode: state.totpCode,
                  kind: state.kind,
                  entityType: state.entityType,
                  firstName: state.firstName,
                  lastName: state.lastName,
                  phone: state.phone,
                  bvn: state.bvn,
                  nin: state.nin,
                })
              : setState({
                  step: 'confirm',
                  email: state.email,
                  otp: state.otp,
                  password: state.password,
                  totpCode: state.totpCode,
                  kind: state.kind,
                  entityType: state.entityType,
                  firstName: state.firstName,
                  lastName: state.lastName,
                  phone: state.phone,
                  identity: state.identity ?? {
                    firstName: state.firstName,
                    lastName: state.lastName,
                    dateOfBirth: '',
                    photoUrl: null,
                  },
                  bvn: state.bvn,
                  nin: state.nin,
                })
          }
        />
      }
    >
      <PinStep
        onDone={(pin) =>
          finish.mutate({
            email: state.email,
            otp: state.otp,
            password: state.password,
            pin,
            totpCode: state.totpCode,
            kind: state.kind,
            entityType: state.entityType,
            firstName: state.firstName,
            lastName: state.lastName,
            phone: state.phone,
            bvn: state.bvn,
            nin: state.nin,
            business: state.business,
          })
        }
      />
      {finish.isError && <p className="mt-3 text-[13px] text-primary-text">{finish.error.message}</p>}
      {finish.isPending && <p className="mt-3 text-sm text-ink-3">Opening your account…</p>}
    </AuthCard>
  );
}

function EmailStep({
  email,
  onEmail,
  onDone,
}: {
  email: string;
  onEmail: (value: string) => void;
  onDone: (next: { email: string; otpHint?: string; mfaRequired?: boolean }) => void;
}) {
  const start = useMutation({
    mutationFn: () => authService.startEmail(email.trim()),
    onSuccess: (result) =>
      onDone({
        email: email.trim(),
        otpHint: result.otp,
        mfaRequired: result.mfaRequired,
      }),
  });

  return (
    <AuthCard title="Create Account" subtitle="Enter your email to get started">
      <form
        className="grid gap-4"
        onKeyDown={submitOnEnter}
        onSubmit={(e) => {
          e.preventDefault();
          start.mutate();
        }}
      >
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@email.com"
          required
          value={email}
          onChange={(e) => onEmail(e.target.value)}
        />
        {start.isError && <p className="text-[13px] text-primary-text">{start.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!email.includes('@') || start.isPending}>
          {start.isPending ? 'Continuing…' : 'Proceed'}
        </Button>
        <p className="text-center text-sm font-medium text-brand">
          Already have an account?{' '}
          <Link to={paths.login} className="text-primary-text">
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

function VerifyEmailStep({
  email,
  otpHint,
  onBack,
  onDone,
}: {
  email: string;
  otpHint?: string;
  onBack: () => void;
  onDone: (otp: string) => void;
}) {
  const [code, setCode] = useState(otpHint ?? demo?.signUp.code ?? '');
  const resend = useMutation({
    mutationFn: () => authService.startEmail(email),
    onSuccess: (result) => {
      if (result.otp) setCode(result.otp);
    },
  });

  return (
    <AuthCard
      title="Verify email"
      subtitle="We've just sent you a 6 digit OTP to your email."
      back={<BackButton onClick={onBack} />}
    >
      <form
        className="grid gap-4"
        onKeyDown={submitOnEnter}
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) onDone(code);
        }}
      >
        <CodeInput label="Email OTP" value={code} onChange={setCode} />
        <button type="button" className="justify-self-start text-sm font-medium text-brand" onClick={() => resend.mutate()}>
          {resend.isPending ? 'Sending…' : 'Resend Code'}
        </button>
        <Button type="submit" size="lg" block disabled={code.length !== 6}>
          Proceed
        </Button>
      </form>
    </AuthCard>
  );
}

function PasswordStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (password: string) => void;
}) {
  const [password, setPassword] = useState(demo?.signUp.password ?? '');
  return (
    <AuthCard
      title="Create Account"
      subtitle="Choose a password, then tell us if this is personal or business."
      back={<BackButton onClick={onBack} />}
    >
      <form
        className="grid gap-4"
        onKeyDown={submitOnEnter}
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length >= 8) onDone(password);
        }}
      >
        <PasswordField
          label="Password"
          autoComplete="new-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" block disabled={password.length < 8}>
          Proceed
        </Button>
      </form>
    </AuthCard>
  );
}
