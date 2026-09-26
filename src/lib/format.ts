const nairaFormatters = new Map<number, Intl.NumberFormat>();

function formatter(decimals: number) {
  let f = nairaFormatters.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    nairaFormatters.set(decimals, f);
  }
  return f;
}

/** 12000345 → "₦12,000,345" (always positive; add your own sign). */
export function formatNaira(amount: number, decimals = 0) {
  return `₦${formatter(decimals).format(Math.abs(amount))}`;
}

/** 25000 → "25,000" — for inputs where the ₦ sign sits outside the field. */
export function formatNumber(value: number) {
  return formatter(0).format(value);
}

/** "25,000" → 25000 */
export function parseAmount(input: string) {
  return Number(input.replace(/[^\d]/g, '')) || 0;
}

/** "7823456109" → "7823 4561 09" (Figma account number style) */
export function formatAccountNumber(accountNumber: string) {
  return accountNumber.replace(/^(\d{4})(\d{4})(\d{2})$/, '$1 $2 $3');
}

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const greetingDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Today", "Yesterday" or "Thu 24 Sep" */
export function formatDayLabel(iso: string, now = new Date()) {
  const diffDays = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return dayFormat.format(new Date(iso)).replace(',', '');
}

export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso)).toUpperCase();
}

export function formatDate(iso: string | Date) {
  return longDate.format(typeof iso === 'string' ? new Date(iso) : iso);
}

export function formatGreetingDate(date = new Date()) {
  return greetingDate.format(date).replace(',', '');
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "Chiamaka Okafor" → "CO" */
export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
