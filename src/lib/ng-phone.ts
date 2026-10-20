/** Canonical local MSISDN: 11 digits starting with 0 (e.g. 08034564521). */
export function normalizeNgPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length >= 13) {
    digits = `0${digits.slice(3)}`;
  }
  if (digits.length === 10 && /^[789]/.test(digits)) {
    digits = `0${digits}`;
  }
  if (/^0[789]\d{9}$/.test(digits)) return digits;
  return null;
}
