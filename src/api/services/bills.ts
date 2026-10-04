import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { discoProvider, NETWORK_PROVIDER, providerToNetwork } from '../mappers';
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

type BudPayList = { data?: Array<Record<string, unknown>> };

function asList(payload: BudPayList | Array<Record<string, unknown>> | undefined) {
  if (Array.isArray(payload)) return payload;
  return payload?.data ?? [];
}

export const billService = {
  async listDataPlans(network: Network): Promise<DataPlan[]> {
    if (env.useMocks)
      return mockResponse(
        mockDataPlans.filter((p) => p.network === network),
        250,
      );
    const provider = NETWORK_PROVIDER[network];
    const payload = await http.get<BudPayList>(`/bills/data/plans/${provider}`);
    return asList(payload).map((item) => ({
      id: String(item.id ?? item.code ?? ''),
      network: providerToNetwork(String(item.provider ?? provider)),
      name: String(item.name ?? 'Data plan'),
      validity: String(item.validity ?? item.name ?? ''),
      price: Number(item.amount ?? item.price ?? 0),
    }));
  },

  async listDiscos(): Promise<Disco[]> {
    if (env.useMocks) return mockResponse(mockDiscos);
    const payload = await http.get<BudPayList>('/bills/electricity/providers');
    return asList(payload).map((item) => {
      const shortName = String(item.provider ?? item.shortName ?? item.name ?? '');
      return {
        id: shortName.toLowerCase(),
        name: String(item.name ?? shortName),
        shortName,
      };
    });
  },

  async lookupMeter(
    discoId: string,
    meterNumber: string,
    meterType: MeterType,
  ): Promise<MeterLookup> {
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
    const payload = await http.post<Record<string, unknown>>('/bills/electricity/validate', {
      provider: discoProvider(discoId),
      type: meterType,
      number: meterNumber,
    });
    const nested = payload.data;
    const data =
      nested && typeof nested === 'object' ? (nested as Record<string, unknown>) : payload;
    return {
      customerName: String(data.Customer_Name ?? data.customer_name ?? 'Customer'),
      address: String(data.address ?? ''),
      meterNumber,
      meterType,
      discoId,
    };
  },

  async pay(body: BillPaymentRequest): Promise<BillPaymentResult> {
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
    const pin = body.authorisation.method === 'pin' ? body.authorisation.pin : undefined;
    if (body.type === 'airtime') {
      return http.post<BillPaymentResult>('/bills/airtime', {
        provider: NETWORK_PROVIDER[body.network],
        number: body.phone,
        amount: body.amount,
        pin,
      });
    }
    if (body.type === 'data') {
      return http.post<BillPaymentResult>('/bills/data', {
        provider: NETWORK_PROVIDER[body.network],
        number: body.phone,
        planId: body.planId,
        amount: body.amount,
        pin,
      });
    }
    return http.post<BillPaymentResult>('/bills/electricity', {
      provider: discoProvider(body.discoId),
      number: body.meterNumber,
      type: body.meterType,
      amount: body.amount,
      pin,
    });
  },
};
