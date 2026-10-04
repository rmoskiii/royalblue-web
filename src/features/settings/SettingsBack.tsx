import { Link } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { paths } from '@/components/layout/navigation';

export function SettingsBack({ label = 'Settings' }: { label?: string }) {
  return (
    <Link
      to={paths.settings}
      className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-ink"
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}
