import { describe, expect, it } from 'vitest';
import {
  ADDRESS_LEAD,
  ADDRESS_LEAD_PENDING,
  addressStepLead,
  billToggleLabel,
  lastRegistryHint,
} from './addressCopy';

describe('addressStepLead', () => {
  it('shows the pending line only while staff have the file', () => {
    expect(addressStepLead(false)).toBe(ADDRESS_LEAD);
    expect(addressStepLead(true)).toBe(ADDRESS_LEAD_PENDING);
  });
});

describe('lastRegistryHint', () => {
  it('hides NIN when the typed line already matches', () => {
    expect(
      lastRegistryHint(
        '53A Mudashiru Eletu Way, Osapa, Lekki',
        '53A Mudashiru Eletu Way, Osapa, Lekki',
      ),
    ).toBeNull();
  });

  it('keeps a stale NIN line so the customer can change it', () => {
    expect(
      lastRegistryHint(
        '53A Mudashiru Eletu Way, Osapa, Lekki',
        '13, okesuna street, lagos island',
      ),
    ).toBe('13, okesuna street, lagos island');
  });
});

describe('billToggleLabel', () => {
  it('offers replace when a file is already on record', () => {
    expect(billToggleLabel(false, null)).toBe('Upload a utility bill');
    expect(billToggleLabel(false, 'Transaction Receipt.pdf')).toBe('Replace bill');
    expect(billToggleLabel(true, 'Transaction Receipt.pdf')).toBe('Hide bill upload');
  });
});
