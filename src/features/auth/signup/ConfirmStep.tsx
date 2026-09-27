import type { IdentityLookup } from '@/api/types';
import { Avatar, Button } from '@/components/ui';
import { formatDate } from '@/lib/format';

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
  return (
    <div className="grid gap-4">
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
        </dl>
      </div>
      <Button size="lg" block onClick={onConfirm}>
        Yes, this is me
      </Button>
      <Button variant="secondary" size="lg" block onClick={onReject}>
        This isn’t me
      </Button>
    </div>
  );
}
