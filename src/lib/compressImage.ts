const SELFIE_EDGE = 720;
const DOCUMENT_EDGE = 1280;
const QUALITY = 0.82;
const SKIP_UNDER_BYTES = 350_000;

/** Shrink KYC photos before upload so desktop webcams and screenshots don’t freeze the tab. */
export async function compressKycImage(file: File, kind: 'document' | 'selfie'): Promise<File> {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') {
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const max = kind === 'selfie' ? SELFIE_EDGE : DOCUMENT_EDGE;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  if (scale === 1 && file.size <= SKIP_UNDER_BYTES && file.type === 'image/jpeg') {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob) return file;
  const name = file.name.replace(/\.\w+$/, '.jpg') || `${kind}.jpg`;
  return new File([blob], name, { type: 'image/jpeg' });
}
