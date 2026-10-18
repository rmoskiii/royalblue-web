import { FileText, Image as ImageIcon, Share2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { Button } from '@/components/ui';
import { shareFile } from '@/lib/clipboard';
import { receiptImageFile, receiptPdfFile } from '../receiptFile';
import type { ReceiptShareInput } from '../receiptImage';

export function ShareReceiptActions({
  receipt,
  secondary,
}: {
  receipt: ReceiptShareInput;
  secondary?: ReactNode;
}) {
  const { showToast } = useToast();
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState<'image' | 'pdf' | null>(null);

  const share = async (kind: 'image' | 'pdf') => {
    setBusy(kind);
    try {
      const file = kind === 'pdf' ? await receiptPdfFile(receipt) : await receiptImageFile(receipt);
      const outcome = await shareFile({ title: 'RoyalBlue receipt', file });
      if (outcome === 'shared') showToast(kind === 'pdf' ? 'Receipt PDF shared' : 'Receipt image shared');
      if (outcome === 'saved') showToast(kind === 'pdf' ? 'Receipt PDF saved' : 'Receipt image saved');
      if (outcome !== 'cancelled') setPicking(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not share receipt');
    } finally {
      setBusy(null);
    }
  };

  if (picking) {
    return (
      <div className="grid w-full gap-2">
        <Button variant="secondary" block disabled={Boolean(busy)} onClick={() => void share('image')}>
          <ImageIcon className="size-4" />
          {busy === 'image' ? 'Preparing image…' : 'Share as image'}
        </Button>
        <Button variant="secondary" block disabled={Boolean(busy)} onClick={() => void share('pdf')}>
          <FileText className="size-4" />
          {busy === 'pdf' ? 'Preparing PDF…' : 'Share as PDF'}
        </Button>
        <Button variant="ghost" block disabled={Boolean(busy)} onClick={() => setPicking(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={`grid w-full gap-2 ${secondary ? 'grid-cols-2' : ''}`}>
      <Button variant="secondary" block onClick={() => setPicking(true)}>
        <Share2 className="size-4" />
        Share receipt
      </Button>
      {secondary}
    </div>
  );
}
