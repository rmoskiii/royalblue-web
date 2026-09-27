import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockAddresses, mockCardSecrets, mockCards, mockPhysicalOrder } from '../mocks/cards';
import type {
  AddressSuggestion,
  Card,
  CardControls,
  CardSecrets,
  PhysicalCardOrder,
  PhysicalCardOrderRequest,
} from '../types';

// TODO(api): confirm card endpoints. Card secrets should come from a PCI-compliant
// provider (often an iframe or tokenised reveal), not a plain JSON response.
export const cardService = {
  list(): Promise<Card[]> {
    if (env.useMocks) return mockResponse(mockCards);
    return http.get<Card[]>('/cards');
  },

  getSecrets(cardId: string): Promise<CardSecrets> {
    if (env.useMocks) return mockResponse(mockCardSecrets[cardId], 500);
    return http.get<CardSecrets>(`/cards/${cardId}/secrets`);
  },

  setFrozen(cardId: string, frozen: boolean): Promise<Card> {
    if (env.useMocks) return mockResponse(updateMockCard(cardId, { frozen }), 400);
    return http.put<Card>(`/cards/${cardId}/freeze`, { frozen });
  },

  updateControls(cardId: string, controls: Partial<CardControls>): Promise<Card> {
    if (env.useMocks) {
      const card = mockCards.find((c) => c.id === cardId)!;
      return mockResponse(
        updateMockCard(cardId, { controls: { ...card.controls, ...controls } }),
        400,
      );
    }
    return http.put<Card>(`/cards/${cardId}/controls`, controls);
  },

  getPhysicalOrder(): Promise<PhysicalCardOrder | null> {
    if (env.useMocks) return mockResponse(mockPhysicalOrder.current);
    return http.get<PhysicalCardOrder | null>('/cards/physical-order');
  },

  orderPhysical(body: PhysicalCardOrderRequest): Promise<PhysicalCardOrder> {
    if (env.useMocks) {
      const now = new Date();
      mockPhysicalOrder.current = {
        id: `ord_${Date.now()}`,
        status: 'ordered',
        ...body,
        orderedAt: now.toISOString(),
        estimatedDelivery: new Date(now.getTime() + 5 * 86_400_000).toISOString(),
      };
      return mockResponse(mockPhysicalOrder.current, 800);
    }
    return http.post<PhysicalCardOrder>('/cards/physical-order', body);
  },

  /** Address lookup for delivery (PRD View 5). */
  searchAddresses(query: string): Promise<AddressSuggestion[]> {
    if (env.useMocks) {
      const q = query.trim().toLowerCase();
      return mockResponse(
        mockAddresses.filter((a) => `${a.line1} ${a.city} ${a.state}`.toLowerCase().includes(q)),
        250,
      );
    }
    return http.get<AddressSuggestion[]>('/addresses/search', { q: query });
  },
};

function updateMockCard(cardId: string, patch: Partial<Card>) {
  const card = mockCards.find((c) => c.id === cardId)!;
  Object.assign(card, patch);
  return card;
}
