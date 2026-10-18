import { describe, expect, it } from 'vitest';
import { jpegToPdf } from './jpegPdf';

describe('jpegToPdf', () => {
  it('wraps a JPEG in a one-page PDF', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const pdf = jpegToPdf(jpeg, 1, 1);
    expect(new TextDecoder().decode(pdf.slice(0, 8))).toBe('%PDF-1.4');
    expect(new TextDecoder().decode(pdf.slice(-7))).toContain('EOF');
    expect(pdf.byteLength).toBeGreaterThan(jpeg.byteLength);
  });
});
