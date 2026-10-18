export const ADDRESS_LEAD =
  'Tier 3 unlocks only if the address Dojah reads on your bill is the same as NIMC. Anything else goes to staff.';

export const ADDRESS_LEAD_PENDING =
  'Staff are reviewing this. Tier 3 stays locked until they approve.';

export function addressStepLead(reviewPending: boolean) {
  return reviewPending ? ADDRESS_LEAD_PENDING : ADDRESS_LEAD;
}

export function lastRegistryHint(current: string, lastRegistry?: string | null) {
  const registry = lastRegistry?.trim();
  if (!registry) return null;
  if (registry.toLowerCase() === current.trim().toLowerCase()) return null;
  return registry;
}

export function billToggleLabel(showBill: boolean, billName?: string | null) {
  if (showBill) return 'Hide bill upload';
  if (billName) return 'Replace bill';
  return 'Upload a utility bill';
}
