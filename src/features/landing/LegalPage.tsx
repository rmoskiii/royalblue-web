import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { Logo, buttonClass } from '@/components/ui';

/** Placeholder for Terms of Service / Privacy Policy until legal provides the copy. */
export function LegalPage({ title }: { title: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg p-6 text-center">
      <div className="grid max-w-md justify-items-center gap-4">
        <Link to={paths.welcome} aria-label="RoyalBlue home">
          <Logo className="h-12" />
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-brand">{title}</h1>
        <p className="text-ink-2">
          We’re finalising this page. For questions in the meantime, contact RoyalBlue customer
          support.
        </p>
        <Link to={paths.welcome} className={buttonClass({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" /> Back to website
        </Link>
      </div>
    </div>
  );
}
