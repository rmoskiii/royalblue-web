import { formatDate, formatNaira, formatTime } from '@/lib/format';

export type ReceiptShareInput = {
  title: string;
  amount: number;
  status?: string;
  counterparty?: string;
  reference: string;
  createdAt?: string;
  fee?: number;
  type?: string;
};

const WIDTH = 720;
const PAD = 48;
const NAVY = '#1b194d';
const INK = '#111827';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines: string[] = [];
  let line = words[0];
  for (const word of words.slice(1)) {
    const next = `${line} ${word}`;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function statusLabel(status?: string) {
  if (status === 'successful') return 'Successful';
  if (status === 'pending') return 'Pending';
  if (status === 'failed') return 'Failed';
  return status ? status[0].toUpperCase() + status.slice(1) : 'Receipt';
}

function statusFill(status?: string) {
  if (status === 'successful') return '#dcfce7';
  if (status === 'pending') return '#fef3c7';
  if (status === 'failed') return '#fee2e2';
  return '#eef2ff';
}

function statusInk(status?: string) {
  if (status === 'successful') return '#166534';
  if (status === 'pending') return '#92400e';
  if (status === 'failed') return '#991b1b';
  return NAVY;
}

/** Branded PNG of the receipt so share/copy works without html-to-image. */
export function renderReceiptPng(input: ReceiptShareInput): Promise<Blob> {
  const name = input.counterparty || input.title;
  const type = input.type || (input.title !== name ? input.title : 'Transaction');
  const when = input.createdAt ? `${formatDate(input.createdAt)}, ${formatTime(input.createdAt)}` : '—';
  const rows: Array<[string, string]> = [
    ['Type', type],
    ['Date', when],
    ['Reference', input.reference],
    ['Fee', input.fee ? formatNaira(input.fee, 2) : 'Free'],
  ];

  const canvas = document.createElement('canvas');
  const scale = 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject(new Error('Could not draw receipt'));
  }

  ctx.font = '600 36px Inter, ui-sans-serif, system-ui, sans-serif';
  const nameLines = wrap(ctx, name, WIDTH - PAD * 2);
  const height = 220 + nameLines.length * 44 + 72 + 56 + rows.length * 56 + 72;
  canvas.width = WIDTH * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#f4f4f7';
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 24, 24, WIDTH - 48, height - 48, 28);
  ctx.fill();

  ctx.fillStyle = NAVY;
  roundRect(ctx, 24, 24, WIDTH - 48, 88, 28);
  ctx.fill();
  ctx.fillRect(24, 68, WIDTH - 48, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 22px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('RoyalBlue MFB', PAD, 78);

  let y = 150;
  ctx.fillStyle = INK;
  ctx.font = '600 36px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (const line of nameLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 44;
  }
  ctx.font = '500 16px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = MUTED;
  ctx.fillText(type, WIDTH / 2, y);
  y += 52;

  ctx.fillStyle = INK;
  ctx.font = '700 48px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(formatNaira(input.amount, 2), WIDTH / 2, y);
  y += 28;

  const chip = statusLabel(input.status);
  ctx.font = '600 14px Inter, ui-sans-serif, system-ui, sans-serif';
  const chipW = Math.max(120, ctx.measureText(chip).width + 28);
  const chipX = (WIDTH - chipW) / 2;
  ctx.fillStyle = statusFill(input.status);
  roundRect(ctx, chipX, y, chipW, 32, 16);
  ctx.fill();
  ctx.fillStyle = statusInk(input.status);
  ctx.textBaseline = 'middle';
  ctx.fillText(chip, WIDTH / 2, y + 16);
  ctx.textBaseline = 'alphabetic';
  y += 56;

  ctx.textAlign = 'left';
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(WIDTH - PAD, y);
  ctx.stroke();

  for (const [label, value] of rows) {
    y += 40;
    ctx.font = '500 16px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = MUTED;
    ctx.fillText(label, PAD, y);
    ctx.fillStyle = INK;
    ctx.font = '600 16px Inter, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'right';
    const valueLines = wrap(ctx, value, WIDTH - PAD * 2 - 140);
    ctx.fillText(valueLines[0], WIDTH - PAD, y);
    ctx.textAlign = 'left';
    y += 16;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(WIDTH - PAD, y);
    ctx.stroke();
  }

  y += 36;
  ctx.textAlign = 'center';
  ctx.fillStyle = MUTED;
  ctx.font = '500 13px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('royalblue.ng', WIDTH / 2, y);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Could not export receipt'));
      else resolve(blob);
    }, 'image/png');
  });
}
