import { networks } from '../reference';
import type { DataPlan, Disco } from '../types';

/** Sample bundles; real plans and prices come from the biller API. */
export const mockDataPlans: DataPlan[] = networks.flatMap(({ id }) => [
  { id: `${id}-1gb-1d`, network: id, name: '1 GB', validity: '1 day', price: 350 },
  { id: `${id}-2gb-7d`, network: id, name: '2 GB', validity: '7 days', price: 1_000 },
  { id: `${id}-5gb-30d`, network: id, name: '5 GB', validity: '30 days', price: 2_500 },
  { id: `${id}-10gb-30d`, network: id, name: '10 GB', validity: '30 days', price: 4_500 },
  { id: `${id}-25gb-30d`, network: id, name: '25 GB', validity: '30 days', price: 9_000 },
]);

export const mockDiscos: Disco[] = [
  { id: 'ekedc', name: 'Eko Electricity (EKEDC)', shortName: 'EKEDC' },
  { id: 'ikedc', name: 'Ikeja Electric (IE)', shortName: 'IE' },
  { id: 'aedc', name: 'Abuja Electricity (AEDC)', shortName: 'AEDC' },
  { id: 'phed', name: 'Port Harcourt Electricity (PHED)', shortName: 'PHED' },
  { id: 'ibedc', name: 'Ibadan Electricity (IBEDC)', shortName: 'IBEDC' },
  { id: 'eedc', name: 'Enugu Electricity (EEDC)', shortName: 'EEDC' },
  { id: 'kedco', name: 'Kano Electricity (KEDCO)', shortName: 'KEDCO' },
];
