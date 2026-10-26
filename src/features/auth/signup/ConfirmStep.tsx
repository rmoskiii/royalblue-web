import type { IdentityLookup } from '@/api/types';
import { env } from '@/config/env';
import { Avatar, Button } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { submitOnEnter, useEnterToSubmit } from '../lib/submitOnEnter';

/** Confirmed BVN or NIN match. Address is collected later from the customer, not from NIN. */
export function ConfirmStep({
  identity,
  onConfirm,
  onReject,
}: {
  identity: IdentityLookup;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const verified = identity.verified === true && !identity.pending;
  const name = [identity.firstName, identity.lastName].filter(Boolean).join(' ');
  const formRef = useEnterToSubmit();
  return (
    <form
      ref={formRef}
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
    >
      <div className="flex items-center gap-3.5 rounded-tile bg-surface-2 p-4">
        {identity.photoUrl ? (
          <img
            src={
              identity.photoUrl.startsWith('http')
                ? identity.photoUrl
                : `${env.apiBaseUrl}${identity.photoUrl}`
            }
            alt=""
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <Avatar name={name || 'RB'} className="size-16 text-lg" />
        )}
        <dl className="grid gap-0.5">
          <dt className="sr-only">Name</dt>
          <dd className="text-lg font-semibold">{name || 'Identity not confirmed'}</dd>
          {verified && identity.dateOfBirth ? (
            <>
              <dt className="sr-only">Date of birth</dt>
              <dd className="text-[13px] text-ink-2">Born {formatDate(identity.dateOfBirth)}</dd>
            </>
          ) : null}
        </dl>
      </div>
      <Button type="submit" size="lg" block disabled={!verified}>
        Yes, this is me
      </Button>
      <Button type="button" variant="secondary" size="lg" block onClick={onReject}>
        This isn’t me
      </Button>
    </form>
  );
}
