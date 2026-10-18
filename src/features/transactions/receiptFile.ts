import { jpegToPdf } from '@/lib/jpegPdf';
import { renderReceiptJpeg, renderReceiptPng, type ReceiptShareInput } from './receiptImage';

function fileBase(reference: string) {
  const safe = reference.replace(/[^\w.-]+/g, '-').slice(0, 48) || 'receipt';
  return `royalblue-receipt-${safe}`;
}

export async function receiptImageFile(input: ReceiptShareInput): Promise<File> {
  const blob = await renderReceiptPng(input);
  return new File([blob], `${fileBase(input.reference)}.png`, { type: 'image/png' });
}

export async function receiptPdfFile(input: ReceiptShareInput): Promise<File> {
  const jpeg = await renderReceiptJpeg(input);
  const bytes = new Uint8Array(await jpeg.blob.arrayBuffer());
  const pdf = jpegToPdf(bytes, jpeg.width, jpeg.height);
  return new File([pdf], `${fileBase(input.reference)}.pdf`, { type: 'application/pdf' });
}
