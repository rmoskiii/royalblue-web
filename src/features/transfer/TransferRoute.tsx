import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { useTransfer } from './TransferProvider';

/** Keeps /transfer working as a link: opens the modal over Home. */
export function TransferRoute() {
  const { openTransfer } = useTransfer();
  useEffect(() => openTransfer(), [openTransfer]);
  return <Navigate to={paths.home} replace />;
}
