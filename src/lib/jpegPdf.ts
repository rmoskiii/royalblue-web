/** One-page PDF wrapping a JPEG so we can share a receipt without extra libraries. */

const encoder = new TextEncoder();

export function jpegToPdf(jpeg: Uint8Array, imageWidth: number, imageHeight: number): Uint8Array {
  const pageWidth = 420;
  const pageHeight = Math.max(1, Math.round((pageWidth * imageHeight) / imageWidth));
  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentBytes = encoder.encode(content);

  const objects: Uint8Array[] = [
    encoder.encode('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'),
    encoder.encode('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'),
    encoder.encode(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
    ),
    concat([
      encoder.encode(`4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`),
      contentBytes,
      encoder.encode('endstream\nendobj\n'),
    ]),
    concat([
      encoder.encode(
        `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.byteLength} >>\nstream\n`,
      ),
      jpeg,
      encoder.encode('\nendstream\nendobj\n'),
    ]),
  ];

  const header = encoder.encode('%PDF-1.4\n%\x80\x80\x80\x80\n');
  const offsets = [0];
  let cursor = header.byteLength;
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(cursor);
    cursor += objects[i].byteLength;
  }
  const xrefStart = cursor;
  const xrefLines = ['xref\n0 6\n0000000000 65535 f \n'];
  for (let i = 1; i <= 5; i += 1) {
    xrefLines.push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  const trailer = encoder.encode(
    `${xrefLines.join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  );
  return concat([header, ...objects, trailer]);
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}
