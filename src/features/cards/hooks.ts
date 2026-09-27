import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/hooks';
import { cardService } from '@/api/services/cards';
import type { Card, CardControls } from '@/api/types';

/** Optimistic card updates: the switch flips at once and rolls back if the API refuses. */
export function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient();

  const patchCache = (patch: (c: Card) => Card) => {
    const previous = queryClient.getQueryData<Card[]>(queryKeys.cards);
    queryClient.setQueryData<Card[]>(queryKeys.cards, (cards = []) =>
      cards.map((c) => (c.id === cardId ? patch(c) : c)),
    );
    return { previous };
  };
  const rollback = (_e: unknown, _v: unknown, ctx?: { previous?: Card[] }) =>
    ctx?.previous && queryClient.setQueryData(queryKeys.cards, ctx.previous);

  const freeze = useMutation({
    mutationFn: (frozen: boolean) => cardService.setFrozen(cardId, frozen),
    onMutate: (frozen) => patchCache((c) => ({ ...c, frozen })),
    onError: rollback,
  });

  const controls = useMutation({
    mutationFn: (patch: Partial<CardControls>) => cardService.updateControls(cardId, patch),
    onMutate: (patch) => patchCache((c) => ({ ...c, controls: { ...c.controls, ...patch } })),
    onError: rollback,
  });

  return { freeze, controls };
}
