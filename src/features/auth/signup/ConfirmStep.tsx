import type { IdentityLookup } from '@/api/types';
import { Avatar, Button } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { submitOnEnter, useEnterToSubmit } from '../lib/submitOnEnter';

/** Shows what NIBSS returned so the customer can confirm it's them. */
export function ConfirmStep({
  identity,
  onConfirm,
  onReject,
}: {
  identity: IdentityLookup;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const name = `${identity.firstName} ${identity.lastName}`;
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
          <img src={identity.photoUrl} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <Avatar name={name} className="size-16 text-lg" />
        )}
        <dl className="grid gap-0.5">
          <dt className="sr-only">Name</dt>
          <dd className="text-lg font-semibold">{name}</dd>
          <dt className="sr-only">Date of birth</dt>
          <dd className="text-[13px] text-ink-2">Born {formatDate(identity.dateOfBirth)}</dd>
          {identity.pending && (
            <dd className="text-[13px] text-ink-3">Name check is still pending. You can continue.</dd>
          )}
        </dl>
      </div>
      <Button type="submit" size="lg" block>
        Yes, this is me
      </Button>
      <Button type="button" variant="secondary" size="lg" block onClick={onReject}>
        This isn’t me
      </Button>
    </form>
  );
}
