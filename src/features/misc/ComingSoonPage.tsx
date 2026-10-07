import { Link } from 'react-router';
import { Card, buttonClass } from '@/components/ui';
import { paths, type NavItem } from '@/components/layout/navigation';

/** Placeholder for destinations that are in the nav but not built yet. */
export function ComingSoonPage({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Card className="mx-auto mt-6 grid max-w-md place-items-center gap-3 px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-brand">
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <h1 className="text-[28px] font-semibold tracking-tight text-brand">{item.label}</h1>
      <p className="text-ink-2">
        {item.label} isn’t in this web app yet. We’ll open it here when it’s ready.
      </p>
      <Link to={paths.home} className={buttonClass({ variant: 'secondary' })}>
        Back to home
      </Link>
    </Card>
  );
}
