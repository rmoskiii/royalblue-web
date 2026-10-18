export const ADDRESS_LEAD =
  'Where you live now. NIN or BVN often still shows an old street — that is fine. Staff confirm, and a recent bill helps.';

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
