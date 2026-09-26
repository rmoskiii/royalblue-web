import { Link } from 'react-router';
import { buttonClass } from '@/components/ui';
import { paths } from '@/components/layout/navigation';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg p-6 text-center">
      <div className="grid gap-3">
        <p className="text-sm font-semibold tracking-wider text-ink-3 uppercase">Error 404</p>
        <h1 className="font-display text-4xl font-medium text-brand">We can’t find that page</h1>
        <Link to={paths.home} className={buttonClass({ className: 'justify-self-center' })}>
          Go to home
        </Link>
      </div>
    </div>
  );
}
