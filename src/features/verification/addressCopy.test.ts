import { describe, expect, it } from 'vitest';
import {
  ADDRESS_LEAD,
  ADDRESS_LEAD_PENDING,
  addressStepLead,
  billToggleLabel,
} from './addressCopy';

describe('addressStepLead', () => {
  it('shows the pending line only while staff have the file', () => {
    expect(addressStepLead(false)).toBe(ADDRESS_LEAD);
    expect(addressStepLead(true)).toBe(ADDRESS_LEAD_PENDING);
  });

  it('quotes the staff reason after a send-back', () => {
    expect(addressStepLead(false, 'Bill is in another name', true)).toBe(
      'Staff sent this back: Bill is in another name',
    );
  });
});

describe('billToggleLabel', () => {
  it('offers replace when a file is already on record', () => {
    expect(billToggleLabel(false, null)).toBe('Upload a utility bill');
    expect(billToggleLabel(false, 'Transaction Receipt.pdf')).toBe('Replace bill');
    expect(billToggleLabel(true, 'Transaction Receipt.pdf')).toBe('Hide bill upload');
  });
});
