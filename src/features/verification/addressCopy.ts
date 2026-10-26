export const ADDRESS_LEAD =
  'Type the address where you live now, then upload a recent utility bill or bank statement in your name. If the address on that bill matches what you typed, you go to Tier 3. If it does not, staff review the file.';

export const ADDRESS_LEAD_PENDING =
  'Staff are reviewing this. Tier 3 stays locked until they approve.';

export const ADDRESS_LEAD_RETURNED =
  'Staff could not approve that bill. Upload a different recent utility bill or bank statement in your name that matches the address you entered.';

export const ADDRESS_FIELD_HINT =
  'Street, area, city, and state — the same line that should appear on your bill.';

export const BILL_UPLOAD_HINT =
  'Utility bill or bank statement from the last 3 months, in your name. We read the address on the file and compare it to the line above.';

export function addressStepLead(
  reviewPending: boolean,
  returnReason?: string | null,
  returned = false,
) {
  if (reviewPending) return ADDRESS_LEAD_PENDING;
  if (returnReason) return `Staff sent this back: ${returnReason}`;
  if (returned) return ADDRESS_LEAD_RETURNED;
  return ADDRESS_LEAD;
}

export function billToggleLabel(showBill: boolean, billName?: string | null) {
  if (showBill) return 'Hide bill upload';
  if (billName) return 'Replace bill';
  return 'Upload a utility bill';
}
