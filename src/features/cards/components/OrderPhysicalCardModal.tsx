import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Search } from 'lucide-react';
import { useDeferredValue, useState, type ChangeEvent, type FormEvent } from 'react';
import { queryKeys, useAddressSearch } from '@/api/hooks';
import { cardService } from '@/api/services/cards';
import type { DeliveryAddress } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Modal, TextField } from '@/components/ui';

/** PRD View 5: order a physical debit card with address lookup. */
export function OrderPhysicalCardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data: suggestions, isFetching } = useAddressSearch(deferredQuery);
  const [address, setAddress] = useState<DeliveryAddress>({ line1: '', city: '', state: '' });
  const [phone, setPhone] = useState('');

  const order = useMutation({
    mutationFn: () => cardService.orderPhysical({ address, phone: `+234${phone}` }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.physicalOrder });
      showToast('Card ordered. We’ll text you when it’s on the way.');
      onClose();
    },
  });

  const valid =
    address.line1.trim() && address.city.trim() && address.state.trim() && /^\d{10}$/.test(phone);
  const set = (key: keyof DeliveryAddress) => (e: ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) order.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title="Order a physical card">
      <form className="grid gap-4 px-4 pt-2 pb-4" onSubmit={submit}>
        <div className="grid gap-1.5">
          <label htmlFor="address-search" className="text-[13px] font-medium text-ink-2">
            Find your address
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" />
            <input
              id="address-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing a street or area"
              autoComplete="off"
              className="h-12 w-full rounded-field border border-transparent bg-surface-2 pr-3.5 pl-10 text-base outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
            />
          </div>
          {query.trim().length >= 3 && (
            <ul className="overflow-hidden rounded-tile border border-line">
              {suggestions?.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setAddress({ line1: s.line1, city: s.city, state: s.state });
                      setQuery('');
                    }}
                    className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-surface-2"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" />
                    <span>
                      <span className="block text-sm">{s.line1}</span>
                      <span className="text-xs text-ink-3">
                        {s.city}, {s.state}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {!isFetching && suggestions?.length === 0 && (
                <li className="px-3.5 py-2.5 text-[13px] text-ink-3">
                  No matches. Enter the address below.
                </li>
              )}
            </ul>
          )}
        </div>

        <TextField label="Street address" value={address.line1} onChange={set('line1')} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="City" value={address.city} onChange={set('city')} />
          <TextField label="State" value={address.state} onChange={set('state')} />
        </div>
        <TextField
          label="Phone for delivery"
          type="tel"
          inputMode="numeric"
          prefix="+234"
          maxLength={10}
          placeholder="8034564521"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/^0/, ''))}
          inputClassName="pl-15 tabular"
          hint="The courier will call this number."
        />
        {order.isError && <p className="text-[13px] text-primary-text">{order.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!valid || order.isPending}>
          {order.isPending ? 'Placing order…' : 'Order card'}
        </Button>
      </form>
    </Modal>
  );
}
