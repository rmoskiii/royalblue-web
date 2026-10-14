import type { Transaction, TransactionCategory } from '@/api/types';

const categoryType: Record<TransactionCategory, string> = {
  income: 'Received',
  transfer: 'Transfer',
  bills: 'Bills',
  airtime: 'Airtime',
  shopping: 'Card',
  loan: 'Loan',
  funding: 'Funding',
};

export function transactionTypeLabel(t: Pick<Transaction, 'type' | 'category' | 'title'>): string {
  if (t.type?.trim()) return t.type.trim();
  if (t.category === 'bills' && /^data\b/i.test(t.title ?? '')) return 'Data';
  if (t.category === 'bills' && /^airtime\b/i.test(t.title ?? '')) return 'Airtime';
  if (t.category === 'bills' && /electricity/i.test(t.title ?? '')) return 'Electricity';
  if (t.category === 'bills' && /\btv\b|dstv|gotv|startimes/i.test(t.title ?? '')) return 'Cable TV';
  return categoryType[t.category] || 'Transaction';
}

/** Bold headline is the person or (for airtime/data) the phone; title is the description. */
export function transactionDisplay(t: Transaction) {
  const type = transactionTypeLabel(t);
  const party = t.counterparty?.trim() || '';
  const description = t.title?.trim() || '';
  const name = party || description;
  return {
    name,
    description: description && description !== name ? description : '',
    type,
  };
}
