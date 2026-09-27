import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockDataPlans, mockDiscos } from '../mocks/bills';
import type {
  BillPaymentRequest,
  BillPaymentResult,
  DataPlan,
  Disco,
  MeterLookup,
  MeterType,
  Network,
} from '../types';

// TODO(api): confirm biller endpoints (PRD FR-07: direct VTU integration).
export const billService = {
  listDataPlans(network: Network): Promise<DataPlan[]> {
    if (env.useMocks)
      return mockResponse(
        mockDataPlans.filter((p) => p.network === network),
        250,
      );
    return http.get<DataPlan[]>('/bills/data-plans', { network });
  },

  listDiscos(): Promise<Disco[]> {
    if (env.useMocks) return mockResponse(mockDiscos);
    return http.get<Disco[]>('/bills/discos');
  },

  /** Validates a meter number and returns the registered customer. */
  lookupMeter(discoId: string, meterNumber: string, meterType: MeterType): Promise<MeterLookup> {
    if (env.useMocks) {
      return mockResponse(
        {
          customerName: 'ADEYEMI TEMIDAYO',
          address: '127 Herbert Macaulay Street, Ebute-Metta, Lagos',
          meterNumber,
          meterType,
          discoId,
        },
        700,
      );
    }
    return http.get<MeterLookup>('/bills/meter', { discoId, meterNumber, meterType });
  },

  pay(body: BillPaymentRequest): Promise<BillPaymentResult> {
    if (env.useMocks) {
      const result: BillPaymentResult = { reference: `RB${Date.now()}` };
      if (body.type === 'electricity' && body.meterType === 'prepaid') {
        result.token = Array.from({ length: 5 }, () =>
          String(Math.floor(1000 + Math.random() * 9000)),
        ).join('-');
        result.units = Math.round((body.amount / 209.5) * 10) / 10;
      }
      return mockResponse(result, 900);
    }
    return http.post<BillPaymentResult>('/bills/pay', body);
  },
};
