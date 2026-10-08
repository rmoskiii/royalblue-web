import { Modal } from '@/components/ui';
import { AccountDetails } from './AccountDetails';

/** Figma: "Start receiving money from anywhere." */
export function ReceiveSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Receive money">
      <div className="px-4 pt-2 pb-4">
        <h3 className="text-xl leading-tight font-semibold tracking-tight text-brand">
          Get paid from any bank
        </h3>
        <p className="mt-1 text-ink-3">Share these details. Transfers arrive instantly.</p>
        <AccountDetails />
      </div>
    </Modal>
  );
}
