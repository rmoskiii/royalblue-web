import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/api/types';
import { transactionDisplay, transactionTypeLabel } from './transactionDisplay';

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: 't1',
    title: 'Transfer',
    counterparty: '',
    amount: 500,
    direction: 'debit',
    createdAt: '2026-10-18T12:00:00.000Z',
    status: 'successful',
    category: 'transfer',
    fee: 0,
    reference: 'ref-1',
    ...partial,
  };
}

describe('transactionTypeLabel', () => {
  it('prefers the API type, then infers data and electricity from the title', () => {
    expect(transactionTypeLabel({ type: 'NIP', category: 'transfer', title: 'Data 2GB' })).toBe('NIP');
    expect(transactionTypeLabel({ category: 'bills', title: 'Data 2GB' })).toBe('Data');
    expect(transactionTypeLabel({ category: 'bills', title: 'Electricity Ikeja' })).toBe('Electricity');
  });
});

describe('transactionDisplay', () => {
  it('uses the counterparty as the headline when present', () => {
    expect(transactionDisplay(tx({ counterparty: 'Ada Obi', title: 'Transfer' }))).toEqual({
      name: 'Ada Obi',
      description: 'Transfer',
      type: 'Transfer',
    });
  });

  it('falls back to the title when there is no counterparty', () => {
    expect(transactionDisplay(tx({ title: 'Airtime ₦200', category: 'airtime' }))).toEqual({
      name: 'Airtime ₦200',
      description: '',
      type: 'Airtime',
    });
  });
});
